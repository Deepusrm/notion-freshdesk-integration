exports.getIfList = function getIfList(text){
    if (text.includes("<ol>") == true || text.includes("<ul>") == true || text.includes("</li>") == true) {
        return true;
    } else {
        return false;
    }
}

exports.getIfContainsTodo = function getIfContainsTodo(text){
    if(text.toLowerCase().includes("to do")|| text.toLowerCase().includes("todo")){
        return true;
    }else{
        return false;
    }
}

exports.deleteBlocks = async function deleteBlocks(deletedBlocks,conversationBlocks){

    let deletedConversations = conversationBlocks;
    for(let block of deletedBlocks){
        deletedConversations = deletedConversations.filter((element)=> element!==block);
    }
    return deletedConversations;
}

exports.deleteConversationIdInDB = async function deleteConversationIdInDB(conversationID,ticket_id){
    const conversationPath = "ticket.conversations."+conversationID;
    await $db.update(ticket_id,"remove",[conversationPath],{setIf:"exist"});
    console.log("conversation id removed from the db successfully!!")
}

exports.isBothJSONEqual = function isBothJSONEqualJSON(list,textContent){
    if(JSON.stringify(list)=== JSON.stringify(textContent)){
        return true;
    }else{
        return false;
    }
}