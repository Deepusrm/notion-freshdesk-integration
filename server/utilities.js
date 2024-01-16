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

exports.updateDBByDelete = async function updateDBByDelete(deletedBlocks,ticketId,conversationBlocks,conversationId){

    let deletedConversations = conversationBlocks;
    for(let block of deletedBlocks){
        deletedConversations = deletedConversations.filter((element)=> element!==block);
    }

    const conversationPath = "ticket.conversations."+conversationId;
    
    await $db.update(ticketId,"set",{[conversationPath]:deletedConversations},{setIf:"exist"});
    console.log("db updated successfully");
}



exports.updateDBByAdd = async function updateDBByAdd(addedBlocks,ticketId,conversationID){
    const conversationPath = "ticket.conversations."+conversationID;

    await $db.update(ticketId,"set",{[conversationPath]:addedBlocks},{setIf:"exist"});
    console.log("db updated successfully");
}