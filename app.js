angular.module('encryptor', [])
.controller('EncryptController', ["CryptoService", function(CryptoService) {
   // Controller variables linked to the DOM
   this.name = "";
   this.password = "";
   this.text = "";
   this.itemlist = [];
   var parent = this;

   // Load any items from storage as long as localStorage
   // works in this browser and they start with our prefix
   if(typeof(Storage) !== "undefined"){
      storeditemlist = Object.keys(localStorage);
      $.each(localStorage, function(key, value){
         if(key.slice(0,14) === "encryptorstore"){
            parent.itemlist.push({
               name: key.slice(15),
               text: value
            });
         }
      });
   }

   // Storage
   this.store = function(){
      try {
         var encrypted = CryptoService.encrypt(this.password, this.text);
      }catch(e){
         window.alert(e);
         console.log(e);
         return;
      }
      this.itemlist.push({
         name: this.name,
         text: encrypted
      });
      
      // If localStorage works, store this item
      if(typeof(Storage) !== "undefined"){
         localStorage.setItem("encryptorstore." + this.name, encrypted);
      }
      
      // Clear the form fields
      this.name = "";
      this.text = "";
      this.password = "";
   };

   // Retrieval
   this.get = function(){
      // Find all items with the same name as the user selection 
      // in the item list
      var matcheditems = $.grep(this.itemlist, function(e){
         return e.name === parent.selecteditem;
      });
      if(matcheditems.length > 0){
         try {
            var itemtext = CryptoService.decrypt(this.password,
               matcheditems[0].text);
            this.name = matcheditems[0].name;
            this.text = itemtext;
         } catch(e) {
            console.log(e);
            window.alert(e);
         }
      }
      this.password = "";
   };
   
   // Deletion
   this.delete = function(){
      var matcheditems = $.grep(this.itemlist, function(e){
         return e.name === parent.selecteditem;
      });
      if(matcheditems.length > 0){
         var index = this.itemlist.indexOf(matcheditems[0]);
         this.itemlist.splice(index, 1);
         localStorage.removeItem("encryptorstore." + matcheditems[0].name);
      }
   };
}]).factory("CryptoService", [function(){
   return {
      encrypt: function(key, data){
         if(key){
            var encrypted = sjcl.encrypt(key, data);
            return encrypted;
         }else{
            throw "CryptoService.NoKey";
         }
      },
      decrypt: function(key, data){
         if(key){
            try{
               var decrypted = sjcl.decrypt(key, data);
               return decrypted;
            }catch(e){
               throw "CryptoService.IncorrectKey";
            }
         }else{
            throw "CryptoService.NoKey";
         }
      }
   };
}]);
