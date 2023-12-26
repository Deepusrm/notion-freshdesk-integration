require('dotenv').config();

exports = {
  // args is a JSON block containing the payload information.
  // args['iparam'] will contain the installation parameter values.
  onConversationCreateHandler: async function(){
    try{
      const conversationData = args["data"];
      console.log(conversationData);
      if(conversationData.private==true){
        $request.invokeTemplate("onCreatingPrivateNote",{})
      }
    }catch(error){
      console.log("Failed due to "+error);
    }

    const databaseId = process.env;
  }
}
