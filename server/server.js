 
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
  
        const parentJSON = (await utils.defaultParentBlock(args));
        const childJSON = (await utils.defaultChildBlock(args));
        const bodyJSON = { ...parentJSON, ...childJSON }

        // calling the function to append block based on the content
        utils.appendBlock(bodyJSON, noteData["body"], noteData["body_text"]);

        const responseData = await $request.invokeTemplate("onCreatingPrivateNote", {
          context: {},
          body: JSON.stringify(bodyJSON)
        })
        const responseJSON = JSON.parse(responseData.response);
        const pageId = responseJSON.id;
        const results = await $request.invokeTemplate("onGettingBlocksOfPage", {
          context: { page_id: pageId }
        })

        ticket.notionPageId = pageId;
        let ticketConversations = ticket.conversations;
        
        const blockIds = utils.returnArrayOfBlockId(results);


        ticketConversations[conversationId] = blockIds;
        $db.update(ticketKey, "set", { ticket }, { setIf: "exist" })
        console.log("note created successfully!")


      } catch (error) { // this code block is to the case if the notion page for that particular ticket has already been created
        console.log(error);
        if (error.message === "The setIf conditional request failed") {
          const notion_page_id = await $db.get(ticketKey);
          const blockJSON = await utils.defaultChildBlock(args);
          // calling the function to append block based on the content
          utils.appendBlock(blockJSON, noteData["body"], noteData["body_text"]);

          const responses = await $request.invokeTemplate("onAppendingToExistingNote", {
            context: { page_id: notion_page_id["ticket"]["notionPageId"] },
            body: JSON.stringify(blockJSON)
          });
          
          const blockIds = utils.returnArrayOfBlockId(responses);

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

    const ticketKey = `ticket-${updatedNoteData.id}`;
    const ticketPage = await $db.get(ticketKey);

    const results = await $request.invokeTemplate("onGettingBlocksOfPage", {
      context: { page_id: ticketPage["notionPageId"] }
    });

    console.log(JSON.parse(results.response));
  }

}