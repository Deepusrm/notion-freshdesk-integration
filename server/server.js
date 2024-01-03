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

        // calling the function to append block based on the content
        appendBlock(bodyJSON, noteData["body"], noteData["body_text"]);

        try {
          const responseData = await $request.invokeTemplate("onCreatingPrivateNote", {
            context: {},
            body: JSON.stringify(bodyJSON)
          })
          const responseJSON = JSON.parse(responseData.response);

          // updating the notion page id from null to the actual value
          $db.update(ticketKey, "set", { "notionPageId": responseJSON.id }, { setIf: "exist" })
          console.log("note created successfully!")
        } catch (error1) {
          throw new Error(error1.response);
        }

      } catch (error2) { // this code block is to the case if the notion page for that particular ticket has already been created
        const notion_page_id = await $db.get(ticketKey);

        const blockJSON = {
          children: []
        }

        // calling the function to append block based on the content
        appendBlock(blockJSON, noteData["body"], noteData["body_text"]);

        try {
          await $request.invokeTemplate("onAppendingToExistingNote", {
            context: { page_id: notion_page_id["notionPageId"] },
            body: JSON.stringify(blockJSON)
          });
          console.log("note added successfully");
        } catch (error3) {
          throw new Error(error3.response);
        }
      }
    }
  }
}

function appendBlock(data, body, bodyText) {
  const list = bodyText.split("  ");
  if (body.includes("<ol>") == true || body.includes("<ul>") ==true || body.includes("</li>") == true) { // for list type of content
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
    })
  }
  // to add a divider between separate notes of the same ticket.
  data["children"].push({
    object: "block",
    type: "divider",
    divider: {}
  })
}
