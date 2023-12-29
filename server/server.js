exports = {
  // args is a JSON block containing the payload information.
  // args['iparam'] will contain the installation parameter values.
  onConversationCreateHandler: async function (args) {

    const noteData = args["data"]["conversation"];

    // checking whether the mode of the note is private or not
    if (noteData.private == true) {

      // creating body JSON to send the details for POST request
      const bodyJSON = {
        parent: {
          type: "database_id",
          database_id: "<%=iparam.notion_database%>"
        },
        properties: {
          Name: {
            title: [
              {
                type: "text",
                text: {
                  content: "TICKET #" + noteData["ticket_id"]
                }
              }
            ]
          }
        },
        children: [
          
        ]
      }

      console.log(noteData["body_text"]);
      // giving different layout for a list and a paragraph 
      if(noteData["body"].includes("<ul>")==true || noteData["body"].includes("<ol>")==true || noteData["body"].includes("</li>")==true){
        const todoList = noteData["body_text"].split("  ");
        console.log(JSON.stringify(todoList));
        for (let i = 0; i < todoList.length; i++) {
          bodyJSON["children"].push({
            object: "block",
            type: "bulleted_list_item",
            bulleted_list_item: {
              rich_text: [
                {
                  type:"text",
                  text: {
                    content: todoList[i]
                  }
                }
              ],
            }
          })
        }
      }else{
        bodyJSON["children"].push({
          object:"block",
          type:"paragraph",
          paragraph:{
            rich_text: [
              {
                type:"text",
                text: {
                  content: noteData["body_text"]
                }
              }
            ]
          }
        })
      }
      // for n number of to-do list, iterating, creating a new block object and pushing into children array
      try {
        const responseData = await $request.invokeTemplate("onCreatingPrivateNote", {
          context: {},
          body: JSON.stringify(bodyJSON)
        })
        const responseJSON = JSON.parse(responseData.response);

        const ticketKey = `ticket-${noteData["ticket_id"]}`;
        const dbstoreResponse = await $db.set(ticketKey,{"notionPageId":responseJSON.id});
        console.log(dbstoreResponse);

        
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Note is not private");
    }
  }
}
