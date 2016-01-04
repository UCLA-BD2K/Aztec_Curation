angular.module('submit', [])
  .controller('ElementListController', ['$scope', function($scope) {
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
      {text:'Resource Name', name:'Resource Details', type: 'text', ngmodel: 'res.name'},
      {text:'Logo URL', type: 'text', ngmodel: 'res.logo'},
      {text:'Description', type: 'text', ngmodel: 'res.desc'},
      {text:'Link URL', type: 'number', ngmodel: 'res.url'}];
      registerFieldList.registerPublication = [{text:'Primary Publication DOI',name:'Publication Details'},
      {text:'Publication DOI', type: 'text'},
      {text:'Tool DOI', type: 'text'},
      {text:'Programming Languages', type: 'text'},
      {text:'Latest Version Number', type: 'text'},
      {text:'Latest Version Release Date', type: 'text'},
      {text:'Previous Version', type: 'text'},
      {text:'Next Version', type: 'text'}];

      registerFieldList.registerLinks =[
      {text:'Link Description', name:'Links', type: 'text'},
      {text:'Source Code URL', type: 'text'}];

       registerFieldList.registerLicenses = [
      {text:'Licenses', name:'Licenses', type: 'text'},
      {text:'License URL', type: 'text'}];
      registerFieldList.registerResourceType =[
      {text:'Resource Type', name:'Resource Types', type: 'text'}
      ];

      registerFieldList.biologicalDomains = [
      {text:'Biological Domain', name:'Biological Domains', type: 'text'}
      ];

      registerFieldList.authorsAndInstitutions  = [
      {text:'Author Name', name:'Authors and Institutions', type: 'text'},
      {text:'Author Email', type: 'email'},
      {text:'Funder', type: 'text'},
      {text:'Platform', type: 'text'}
      ];

      registerFieldList.fileTypes = [
      {text:'Input File Type', name:'File Types', type: 'text'},
      {text:'Output File Type', type: 'text'}
      ];


      registerFieldList.tools = [
      {text:'Downstream Tool', name:'Tools', type: 'text'},
      {text:'Upstream Tool', type: 'text'}];

      registerFieldList.dependencies = [
      {text:'Dependency', name:'Dependencies', type: 'text'},
      ];

      registerFieldList.tag = [
      {text:'Tags', name:'Tags', type: 'text'}
      ];

      registerFieldList.maintainers = [
      {text:'Maintainer Name', name:'Maintainers', type: 'text'},
      {text:'Maintainer Email', type: 'email'}
      ];

      $scope.submit = function(res){
        console.log(1);
        $http.post('/create', res);
      };

}]);

 angular.bootstrap(document.getElementById("Reg-Angular"),['submit']);     /*
 .controller('RegisterFieldListController', function() {

});
 /*
    todoList.addTodo = function() {
      todoList.todos.push({text:todoList.todoText, done:false});
      todoList.todoText = '';
    };
*/
