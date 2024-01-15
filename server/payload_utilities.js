const payloadUtils = require('./utilities');

exports.defaultParentBlock = async function (payload) {
    const noteData = payload.data.conversation;

    const parentJSON = {
        parent: {
            type: "database_id",
            database_id: "<%=iparam.notion_database%>"
        },
        properties: {
            Name: {
                title: [{
                    type: "text",
                    text: {
                        content: "TICKET #" + noteData["ticket_id"]
                    }
                }]
            }
        }
    }

    return parentJSON
}

function returnReadableDate(timestamp) {
    const date = new Date(timestamp);
    const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    }
    const readableDate = date.toLocaleString('en-US', options)
    return readableDate;
}


exports.defaultChildBlock = async function (payload) {
    const noteData = payload.data.conversation;

    let createdAt = returnReadableDate(noteData["created_at"]);
    let modifiedAt = returnReadableDate(noteData["updated_at"]);

    const childJSON = {
        children: [
            {
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: `Created at ${createdAt}, modified at ${modifiedAt}`
                            },
                            annotations: {
                                italic: true,
                                color: "gray"
                            }
                        }
                    ]
                }
            }
        ]
    }

    return childJSON
}

exports.appendBlock = async function appendBlock(data, body, bodyText) {
    // const result = { ...data };
    const list = bodyText.split("  ");
    const isList = payloadUtils.getIfList(body);
    const isTodoList = isList && payloadUtils.getIfContainsTodo(body);
     
    if (isList && isTodoList) { // for list type of content
        list.forEach(element => {
            const isContainingTodo = payloadUtils.getIfContainsTodo(element);
            if (isContainingTodo) {
                data["children"].push({
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: element
                                }
                            }
                        ]
                    }
                });
            } else {
                data["children"].push({
                    object: "block",
                    type: "to_do",
                    to_do: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: element
                                }
                            }
                        ],
                        checked: false,
                        color: "default"
                    }
                });
            }
        });
        
    } else if (isList) {
        list.forEach(element => {
            data["children"].push({
                object: "block",
                type: "bulleted_list_item",
                bulleted_list_item: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: element
                            }
                        }
                    ]
                }
            })
        });
        
    } else { // for paragraph type of content
        data["children"].push({
            object: "block",
            type: "paragraph",
            paragraph: {
                rich_text: [
                    {
                        type: "text",
                        text: {
                            content: bodyText
                        }
                    }
                ]
            }
        });

    }
    // to add a divider between separate notes of the same ticket.
    data["children"].push({
        object: "block",
        type: "divider",
        divider: {}
    })
}

exports.returnArrayOfBlockId = function (payload){
    const responseData = JSON.parse(payload.response);

    const filteredResults = responseData["results"].filter(element=> (element["type"]!="divider"));

    let blockIds = [];
    filteredResults.forEach((element)=>{
        blockIds.push(element["id"]);
    })

    return blockIds;
}

exports.returnListArray = function(sentence){
    const array = sentence.split("  ");
    // const listArray = array.filter((element)=> !payloadUtils.getIfContainsTodo(element));

    return array;
}

exports.returnArrayOfBlockObjects = async function returnArrayOfBlockObjects(blockIds){
    const arrayOfBlockObjects = [];

    for(const id of blockIds){
        let element = await getBlockObject(id);
        const blockDetails = {
            "blockId":"",
            "content":"",
            "type":""
        }

        let content;

        
        if(element["type"]=="bulleted_list_item"){
            blockDetails.blockId = id
            blockDetails.type = element["type"];
            content = element["bulleted_list_item"]["rich_text"][0]["text"]["content"]
            blockDetails.content = content;

            arrayOfBlockObjects.push(blockDetails);
        }else if(element["type"]=="to_do"){
            blockDetails.blockId = id
            blockDetails.type = element["type"];
            content = element["to_do"]["rich_text"][0]["text"]["content"]
            blockDetails.content = content;

            arrayOfBlockObjects.push(blockDetails);
        }else if(element["type"]=="paragraph"){
            content = element["paragraph"]["rich_text"][0]["text"]["content"];
            if(!content.startsWith("Created at")){
                blockDetails.blockId = id
                blockDetails.type = element["type"];
                blockDetails.content = content;

                arrayOfBlockObjects.push(blockDetails);
            }
        }
    }
    
    console.log(arrayOfBlockObjects);
   return arrayOfBlockObjects;

}

async function getBlockObject(id){
    try{
        const response = await $request.invokeTemplate("onGettingParticularBlock",{
            context:{block_id : id}
        })
        const results = JSON.parse(response.response);
        return results;
    }catch(error){
        console.error(error);
    }
    
}

exports.returnDeletedblocks = function returnDeletedblocks(list,blocks){
    const deletedBlocks = [];
    for(const block of blocks){
        if(!list.includes(block["content"])){
            deletedBlocks.push(block["blockId"]);
        }
    }
    console.log(deletedBlocks);
    return deletedBlocks;
}

exports.returnAddedBlocks = async function returnAddedBlocks(listArray,blockArray,pageId,conversationIds,textArray){
    let noHeadingListArray = listArray.slice(1,listArray.length);
    console.log(noHeadingListArray)
    let noHeadingBlockArray = blockArray.slice(1,blockArray.length);
    console.log(noHeadingBlockArray);

    let addedBlocks = conversationIds;

    for (const list in noHeadingListArray) {
        console.log(list);
        let addedContent = noHeadingListArray[list];
        console.log(addedContent);
        if(textArray.includes(addedContent)==false){
            let parentBlockId = blockArray[list]["blockId"];
            let type = noHeadingBlockArray[list-1]["type"];

            const generatedBlock = generateBlock(parentBlockId,addedContent,type);

            const newBlockId = await addBlock(generatedBlock,pageId);
            console.log(newBlockId);

            // addedBlocks.push({"indexToBeAdded":list,"newBlockId":newBlockId});

            addedBlocks.splice(list,0,newBlockId);
        }
    }
    console.log(addedBlocks);
    return addedBlocks;
}

function generateBlock(parentBlockId,addedContent,contentType){
    let blockToBeAdded  = {
        children:[
            {
                object:"block",
                type:contentType,
                [contentType]:{
                    rich_text:[{
                        type:"text",
                        text:{
                            content:addedContent
                        }
                    }]
                }
            }
        ],
        after:parentBlockId
    }

    return blockToBeAdded;
}

const addBlock = async function addBlock(block,pageId){
    const response = await $request.invokeTemplate("onAppendingToExistingNote",{
        context:{page_id:pageId},
        body:JSON.stringify(block)
    })

    const result = JSON.parse(response.response);
    console.log(result["results"]);
    return result["results"][0]["id"];
}

exports.deleteBlock = async function deleteBlock(blockId){
    const response = await $request.invokeTemplate("onDeletingBlock",{
        context:{block_id:blockId}
    })
    console.log(response);
}