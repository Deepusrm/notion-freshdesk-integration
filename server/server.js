exports = {
  // args is a JSON block containing the payload information.
  // args['iparam'] will contain the installation parameter values.
  onConversationCreateHandler: async function(){
    // const noteData = args['data']['conversation'];
    // try{
    //   if(noteData.private==true){
    //     await $request.invokeTemplate("onCreatingPrivateNote",{
    //       context:{},
    //       body:JSON.stringify(
    //         {
    //           "parent": {"database_id": "<%=iparam.notion_page%>"},
    //           "properties": {
    //               "title": {"title": [{"text": {"content": "My Notion Page"}}]},
    //               "body": {"rich_text": [{"text": {"content": "This is the content of my page."}}]},
    //           },
    //         })
    //       })
    //     console.log("notion page created successfully!!");
    //   }
    // }catch(error){
    //   console.log(error);
    // }

    // console.log(noteData.private);

    try{
      const pages = await $request.invokeTemplate("onGettingPages",{});
      console.log(pages.response);
    }catch(error){
      console.log(error);
    }
  }
};
