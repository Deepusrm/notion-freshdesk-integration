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

    const filteredResults = responseData["results"].filter(element=> (element["type"]!="divider"&& element["type"]!=="paragraph"));

    let blockIds = [];
    filteredResults.forEach((element)=>{
        blockIds.push(element["id"]);
    })

    return blockIds;
}

exports.returnListArray = function(sentence){
    const array = sentence.split("  ");
    const listArray = array.filter((element)=> !payloadUtils.getIfContainsTodo(element));

    return listArray;
}

exports.returnArrayOfBlockObjects = async function returnArrayOfBlockObjects(blockIds){
    const arrayOfBlockObjects = [];

    for(const id of blockIds){
        let element = await getBlockObject(id);
        const blockDetails = {
            "blockId":"",
            "content":""
        }
        blockDetails.blockId = id
        if(element["type"]=="bulleted_list_item"){
            blockDetails.content = element["bulleted_list_item"]["rich_text"][0]["text"]["content"];
        }else if(element["type"]=="to_do"){
            blockDetails.content = element["to_do"]["rich_text"][0]["text"]["content"];
        }
        arrayOfBlockObjects.push(blockDetails);
    }
    
   return arrayOfBlockObjects;

}

async function getBlockObject(id){
    const response = await $request.invokeTemplate("onGettingParticularBlock",{
        context:{block_id : id}
    })
    const results = JSON.parse(response.response);
    return results;
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


exports.deleteBlock = async function deleteBlock(blockId){
    const response = await $request.invokeTemplate("onDeletingBlock",{
        context:{block_id:blockId}
    })
    console.log(response);
}