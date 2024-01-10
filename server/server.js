// import * as utils from './utilities'; 
const utils = require('./utilities');
exports = {
  // args is a JSON block containing the payload information.
  // args['iparam'] will contain the installation parameter values.
  onConversationCreateHandler: async function (args) {
    const noteData = args.data.conversation;

    if (noteData.private == true) {
      const ticketKey = `ticket-${noteData["ticket_id"]}`;
      try {
        // setting the notion page id as null to update later.
        await $db.set(ticketKey, { "notionPageId": "" }, { setIf: "not_exist" });

        const parentJSON = (await utils.defaultParentBlock(args));
        const childJSON = (await utils.defaultChildBlock(args));
        const bodyJSON = {...parentJSON,...childJSON}

        console.log(bodyJSON);
        // calling the function to append block based on the content
        utils.appendBlock(bodyJSON, noteData["body"], noteData["body_text"]);

        const responseData = await $request.invokeTemplate("onCreatingPrivateNote", {
          context: {},
          body: JSON.stringify(bodyJSON)
        })
        const responseJSON = JSON.parse(responseData.response);

        // updating the notion page id from null to the actual value
        $db.update(ticketKey, "set", { "notionPageId": responseJSON.id }, { setIf: "exist" })
        console.log("note created successfully!")


      } catch (error) { // this code block is to the case if the notion page for that particular ticket has already been created
        console.log(error);
        if (error.message === "The setIf conditional request failed") {
          // newNoteOnExistingPageHandler();
          const notion_page_id = await $db.get(ticketKey);
          const block = utils.defaultChildBlock(args);
          const blockJSON = {...block}

          // calling the function to append block based on the content
          utils.appendBlock(blockJSON, noteData["body"], noteData["body_text"]);
          await $request.invokeTemplate("onAppendingToExistingNote", {
            context: { page_id: notion_page_id["notionPageId"] },
            body: JSON.stringify(blockJSON)
          });
          console.log("note added successfully");
        }else{
          console.error(error);
        }
      }
    }
  },
  
}