angular.module('submit', [])
  .controller('ElementListController', function() {
    var elementList = this;
    elementList.elements = [
      {text:'Resource Details'},
      {text:'Publication Details'},
      {text:'Links'},
      {text:'Licenses'},
      {text:'Resource Types'},
      {text:'Biological Domains'},
      {text:'Authors and Institutions'},
      {text:'File Types'},
      {text:'Tools'},
      {text:'Dependencies'},
      {text:'Tags'},
      {text:'Maintainers'}
      ];

    var registerFieldList = this;
    registerFieldList.registerResources = [
      {text:'Resource Name', name:'Resource Details'},
      {text:'Logo URL'},
      {text:'Description'},
      {text:'Link URL'}];
      registerFieldList.registerPublication = [{text:'Primary Publication DOI',name:'Publication Details'},
      {text:'Publication DOI'},
      {text:'Tool DOI'},
      {text:'Programming Languages'},
      {text:'Latest Version Number'},
      {text:'Latest Version Release Date'},
      {text:'Previous Version'},
      {text:'Next Version'}];

      registerFieldList.registerLinks =[
      {text:'Link Description', name:'Links'},
      {text:'Source Code URL'}];
       
       registerFieldList.registerLicenses = [
      {text:'Licenses', name:'Licenses'},
      {text:'License URL'},];
      registerFieldList.registerResourceType =[
      {text:'Resource Type', name:'Resource Types'}
      ];

      registerFieldList.biologicalDomains = [
      {text:'Biological Domain', name:'Biological Domains'}
      ];
      
      registerFieldList.authorsAndInstitutions  = [
      {text:'Author Name', name:'Authors and Institutions'},
      {text:'Author Email'},
      {text:'Funder'},
      {text:'Platform'}
      ];

      registerFieldList.fileTypes = [
      {text:'Input File Type', name:'File Types'},
      {text:'Output File Type'}
      ];


      registerFieldList.tools = [
      {text:'Downstream Tool', name:'Tools'},
      {text:'Upstream Tool'}];

      registerFieldList.dependencies = [
      {text:'Dependency', name:'Dependencies'},
      ];

      registerFieldList.tag = [
      {text:'Tags', name:'Tags' }
      ];

      registerFieldList.maintainers = [
      {text:'Maintainer Name', name:'Maintainers'},
      {text:'Maintainer Email'}
      ];

});

 angular.bootstrap(document.getElementById("Reg-Angular"),['submit']);     /*
 .controller('RegisterFieldListController', function() {
  
});         
 /*
    todoList.addTodo = function() {
      todoList.todos.push({text:todoList.todoText, done:false});
      todoList.todoText = '';
    };
*/