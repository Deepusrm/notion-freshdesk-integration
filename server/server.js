exports = {
  // args is a JSON block containing the payload information.
  // args['iparam'] will contain the installation parameter values.
  // onTicketCreateHandler: function(args) {
  //   const requesterData = args['data']['requester'];
  //   const agentData = args['data']['actor'];
  //   console.log('Welcome to freshdesk \n' + JSON.stringify(requesterData)+'\n'+JSON.stringify(agentData));
  // }

  onConversationCreateHandler: async function(args){
    const noteData = args['data']['conversation'];
    try{
      if(noteData.private==true){
        await $request.invokeTemplate("onCreatingPrivateNote",{
          context:{},
          body:JSON.stringify(
            {
              "parent": {"database_id": "<%=iparam.notion_page%>"},
              "properties": {
                  "title": {"title": [{"text": {"content": "My Notion Page"}}]},
                  "body": {"rich_text": [{"text": {"content": "This is the content of my page."}}]},
              },
            })
          })
        console.log("notion page created successfully!!");
      }
    }catch(error){
      console.log(error);
    }

    console.log(noteData.private);

    // try{
    //   const page = await $request.invokeTemplate("onGettingPages",{});
    //   console.log("Here's your page \n"+page);
    // }catch(error){
    //   console.log(error);
    // }
  }
};
