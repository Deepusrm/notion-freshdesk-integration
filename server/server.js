 
const payloadUtils = require('./payload_utilities');
const utils = require('./utilities');

exports = {
  // args is a JSON block containing the payload information.
  // args['iparam'] will contain the installation parameter values.
  onConversationCreateHandler: async function (args) {
    const noteData = args.data.conversation;
    if (noteData.private == true) {
      const ticketKey = `ticket-${noteData["ticket_id"]}`;
      const conversationId = `No-${noteData["id"]}`;
      let ticket = {
        "notionPageId": "",
        "conversations": {}
      }
      try {
        // setting the notion page id as null to update later.
        await $db.set(ticketKey, { ticket }, { setIf: "not_exist" });
  
        // creating bodyJSON
        const parentJSON = (await payloadUtils.defaultParentBlock(args));
        const childJSON = (await payloadUtils.defaultChildBlock(args));
        const bodyJSON = { ...parentJSON, ...childJSON }
        payloadUtils.appendBlock(bodyJSON, noteData["body"], noteData["body_text"]);

        //invoking template for creating a page and adding note for the particular ticket.
        const responseData = await $request.invokeTemplate("onCreatingPrivateNote", {
          context: {},
          body: JSON.stringify(bodyJSON)
        })

        // getting the page id from the response we got
        const responseJSON = JSON.parse(responseData.response);
        const pageId = responseJSON.id;

        // using the page id, we are getting the object blocks by invoking template
        const results = await $request.invokeTemplate("onGettingBlocksOfPage", {
          context: { page_id: pageId }
        })

        ticket.notionPageId = pageId;
        const blockIds = payloadUtils.returnArrayOfBlockId(results);

        let ticketConversations = ticket.conversations;
        ticketConversations[conversationId] = blockIds;
        $db.update(ticketKey, "set", { ticket }, { setIf: "exist" })
        console.log("note created successfully!")


      } catch (error) { // this code block is to the case if the notion page for that particular ticket has already been created
        console.log(error);
        if (error.message === "The setIf conditional request failed") {
          const notion_page_id = await $db.get(ticketKey);
          const blockJSON = await payloadUtils.defaultChildBlock(args);
          // calling the function to append block based on the content
          payloadUtils.appendBlock(blockJSON, noteData["body"], noteData["body_text"]);

          const responses = await $request.invokeTemplate("onAppendingToExistingNote", {
            context: { page_id: notion_page_id["ticket"]["notionPageId"] },
            body: JSON.stringify(blockJSON)
          });
          
          const blockIds = payloadUtils.returnArrayOfBlockId(responses);

          let conversation = "ticket.conversations."+conversationId;
          await $db.update(ticketKey,"set",{[conversation]:blockIds},{setIf:"exist"});
          console.log("note added successfully");
        } else {
          console.error(error);
        }
      }
    }
  },

  onConversationUpdateHandler: async function (args) {
    const updatedNoteData = args.data.conversation;
    if(updatedNoteData.private==true){
      const body = updatedNoteData["body"]
      let isList = utils.getIfList(body);
      if(isList){
        const listArray = payloadUtils.returnListArray(updatedNoteData["body_text"]);
        const ticketKey = `ticket-${updatedNoteData["ticket_id"]}`;
        const conversationId = `No-${updatedNoteData["id"]}`;
        const ticket = await $db.get(ticketKey);

        const conversationBlocks = ticket["ticket"]["conversations"][conversationId];

        const blockArray = await payloadUtils.returnArrayOfBlockObjects(conversationBlocks);
        if(listArray.length < blockArray.length){
          const deletedBlocks = payloadUtils.returnDeletedblocks(listArray,blockArray);
          for(let block of deletedBlocks){
            await payloadUtils.deleteBlock(block);
            console.log(block+" deleted successfully");
          }

          utils.updateDBByDelete(deletedBlocks,ticketKey,conversationBlocks,conversationId);

        }else if(listArray.length > blockArray.length){
          const pageId = ticket["ticket"]["notionPageId"];

          const blockContentArray = utils.returnContentArray(blockArray);
          const addedBlocks = await payloadUtils.returnAddedBlocks(listArray,blockArray,pageId,conversationBlocks,blockContentArray);

          const response = await utils.updateDBByAdd(addedBlocks,ticketKey,conversationId);
          console.log(response);
        }
      }
    }
  },

  

}