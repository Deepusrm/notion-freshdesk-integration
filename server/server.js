exports = {
  // args is a JSON block containing the payload information.
  // args['iparam'] will contain the installation parameter values.
  onConversationCreateHandler: async function (args) {
    const noteData = args.data.conversation;

    if (noteData.private == true) {
      const ticketKey = `ticket-${noteData["ticket_id"]}`;
      try {
        await $db.set(ticketKey, { "notionPageId": "" }, { setIf: "not_exist" });
        const bodyJSON = {
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
          },
          children: []
        }

        appendBlock(bodyJSON, noteData["body"], noteData["body_text"]);

        try {
          const responseData = await $request.invokeTemplate("onCreatingPrivateNote", {
            context: {},
            body: JSON.stringify(bodyJSON)
          })
          const responseJSON = JSON.parse(responseData.response);
          $db.update(ticketKey, "set", { "notionPageId": responseJSON.id }, { setIf: "exist" })
        } catch (error1) {
          console.log("Error 1:" + error1);
        }

      } catch (error2) {
        const notion_page_id = await $db.get(ticketKey);

        const blockJSON = {
          children: []
        }
        appendBlock(blockJSON, noteData["body"], noteData["body_text"]);
        try {
          await $request.invokeTemplate("onAppendingToExistingNote", {
            context: { page_id: notion_page_id["notionPageId"] },
            body: JSON.stringify(blockJSON)
          });
          console.log("note added successfully");
        } catch (error3) {
          console.log(error3);
        }
      }
    }
  }
}

function appendBlock(data, body, bodyText) {
  if (body.includes("<ol>") == true || body.includes("<ul>") || body.includes("</li>") == true) {
    const todoList = bodyText.split("  ");
    for (let i = 0; i < todoList.length; i++) {
      data["children"].push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [
            {
              type: "text",
              text: {
                content: todoList[i]
              }
            }
          ]
        }
      })
    }
  } else {
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
    })
  }
  data["children"].push({
    object:"block",
    type:"divider",
    divider:{}
  })
}