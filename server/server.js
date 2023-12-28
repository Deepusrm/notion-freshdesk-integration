exports = {
  // args is a JSON block containing the payload information.
  // args['iparam'] will contain the installation parameter values.
  onConversationCreateHandler: async function (args) {

    const noteData = args["data"]["conversation"];

    // checking whether the mode of the note is private or not
    if (noteData.private == true) {
      // for a to-do list, splitting whole string into an array
      const todoList = noteData["body_text"].split("\n");

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
          {
            object: "block",
            type: "heading_2",
            heading_2: {
              rich_text: [
                {
                  text: {
                    content: todoList[0]
                  }
                }
              ]
            }
          }
        ]
      }

      // for n number of to-do list, iterating, creating a new block object and pushing into children array
      for (let i = 1; i < todoList.length; i++) {
        bodyJSON["children"].push({
          object: "block",
          type: "to_do",
          to_do: {
            rich_text: [
              {
                text: {
                  content: i+todoList[i]
                }
              }
            ],
          }
        })
      }
      try {
        const response = await $request.invokeTemplate("onCreatingPrivateNote", {
          context: {},
          body: JSON.stringify(bodyJSON)
        })
        
        // const dbstoreResponse = await $db.set(
        //   noteData["ticket_id"],{
        //     notion_page_id:response.response["id"]
        //   }
        // )
        // console.log(dbstoreResponse);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Note is not private");
    }
  }
}
