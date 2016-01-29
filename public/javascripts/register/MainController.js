(function() {

  'use strict';

  var app = angular.module('Aztec', ['formly', 'formlyBootstrap', 'ui.bootstrap', 'ui.select', 'ngTagsInput', 'ngSanitize', 'ngMessages'], function config(formlyConfigProvider) {
    var unique = 1;
    formlyConfigProvider.setType({
      name: 'repeatSection',
      templateUrl: 'repeatSection.html',
      controller: function($scope) {
        $scope.formOptions = {
          formState: $scope.formState
        };
        $scope.addNew = addNew;

        $scope.copyFields = copyFields;


        function copyFields(fields) {
          fields = angular.copy(fields);
          addRandomIds(fields);
          return fields;
        }

        function addNew() {
          $scope.model[$scope.options.key] = $scope.model[$scope.options.key] || [];
          var repeatsection = $scope.model[$scope.options.key];
          var lastSection = repeatsection[repeatsection.length - 1];
          var newsection = {};

          repeatsection.push(newsection);
        }

        function addRandomIds(fields) {
          unique++;
          angular.forEach(fields, function(field, index) {
            if (field.fieldGroup) {
              addRandomIds(field.fieldGroup);
              return; // fieldGroups don't need an ID
            }

            if (field.templateOptions && field.templateOptions.fields) {
              addRandomIds(field.templateOptions.fields);
            }

            field.id = field.id || (field.key + '_' + index + '_' + unique + getRandomInt(0, 9999));
          });
        }

        function getRandomInt(min, max) {
          return Math.floor(Math.random() * (max - min)) + min;
        }
      }
    });


  });

  app.run(function(formlyConfig, formlyValidationMessages) {
    var attributes = [
      'date-disabled',
      'custom-class',
      'show-weeks',
      'starting-day',
      'init-date',
      'min-mode',
      'max-mode',
      'format-day',
      'format-month',
      'format-year',
      'format-day-header',
      'format-day-title',
      'format-month-title',
      'year-range',
      'shortcut-propagation',
      'uib-datepicker',
      'show-button-bar',
      'current-text',
      'clear-text',
      'close-text',
      'close-on-date-selection',
      'datepicker-append-to-body'
    ];

    var bindings = [
      'datepicker-mode',
      'min-date',
      'max-date'
    ];

    var ngModelAttrs = {};

    angular.forEach(attributes, function(attr) {
      ngModelAttrs[camelize(attr)] = {
        attribute: attr
      };
    });

    angular.forEach(bindings, function(binding) {
      ngModelAttrs[camelize(binding)] = {
        bound: binding
      };
    });

    formlyConfig.setType({
      name: 'datepicker',
      templateUrl: 'datepicker.html',
      wrapper: ['bootstrapLabel', 'bootstrapHasError'],
      defaultOptions: {
        ngModelAttrs: ngModelAttrs,
        templateOptions: {
          datepickerOptions: {
            format: 'MM.dd.yyyy',
            initDate: new Date()
          }
        }
      },
      controller: ['$scope', function($scope) {
        $scope.datepicker = {};

        $scope.datepicker.opened = false;

        $scope.datepicker.open = function($event) {
          $scope.datepicker.opened = true;
        };
      }]
    });



    formlyConfig.extras.removeChromeAutoComplete = true;
    formlyConfig.setType({
      name: 'typeahead-async',
      templateUrl: 'typeahead-async.html',
      controller: ['$scope', '$http', function($scope, $http) {
        $scope.getItems = function(val, url) {
          console.log($scope.link);
          return $http.get(url, {
            params: {
              q: val
            }
          }).then(function(response) {
            return response.data.map(function(item) {
              console.log(item);
              return item;
            });
          });
        };
      }]
    });

    formlyConfig.setType({
      name: 'typeahead',
      templateUrl: 'typeahead.html',
      wrapper: ['bootstrapLabel', 'bootstrapHasError'],
    });

    formlyConfig.setType({
      name: 'tag',
      templateUrl: 'tags.html',
      controller: ['$scope', '$http', function($scope, $http) {

        $scope.getItems = function(val, url, attr) {
          return $http.get(url, {
            params: {
              q : val
            }
          }).then(function(response){
            return response.data.map(function(item){
              return item[attr];
            });
          });
        };
      }]
    });
    formlyConfig.setType({
      name: 'ui-select-single-search',
      extends: 'select',
      templateUrl: 'ui-select-single-async-search.html'
    });



    function camelize(string) {
      string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
        return chr ? chr.toUpperCase() : '';
      });
      // Ensure 1st char is always lowercase
      return string.replace(/^([A-Z])/, function(match, chr) {
        return chr ? chr.toLowerCase() : '';
      });
    };

    formlyValidationMessages.addStringMessage('required', 'This field is required');
  });

  app.config(function (formlyConfigProvider) {

  formlyConfigProvider.setWrapper({
    name: 'validation',
    types: ['input', 'textarea', 'typeahead','typeahead-async', 'select'],
    templateUrl: 'error-messages.html'
  });

});
  app.controller('MainController', MainController);

  function MainController($scope, $http, $q, $window) {

    var vm = this;
    vm.onNewSubmit = onNewSubmit;
    vm.onEditSubmit = onEditSubmit;
    vm.save = save;
    vm.beforeSaveCheck = beforeSaveCheck;
    vm.suggest = suggest;
    vm.checkForm = checkForm;
    vm.passWarning = passWarning;
    vm.init = init;

    // The model object that we reference
    // on the <formly-form> element in index.html
    vm.basic = {};
    $scope.basic = vm.basic;
    vm.authors = {};
    vm.publication = {};
    vm.links = {};
    vm.dev = {};
    vm.version = {};
    vm.versionOptions = {};
    vm.io = {};
    vm.license = {};
    vm.funding = {};

    //validators

    var emailValidator = {
        expression: function(viewValue, modelValue) {
          var value = modelValue || viewValue;
          return $window.validator.isEmail(value);
        },
        message: '$viewValue + " is not a valid email address"'
      };



    // An array of our form fields with configuration
    // and options set. We make reference to this in
    // the 'fields' attribute on the <formly-form> element
    vm.basicFields = [{
        key: 'res_name',
        type: 'input',
        templateOptions: {
          type: 'text',
          label: 'Resource Name',
          placeholder: 'Enter the name of the resource',
          required: true
        }
      }, {
        key: 'res_logo',
        type: 'input',
        templateOptions: {
          type: 'text',
          label: 'Logo URL',
          placeholder: 'Enter the URL for the logo image (optional)',
          required: false
        }
      }, {
        key: 'res_desc',
        type: 'textarea',
        templateOptions: {
          label: 'Description',
          placeholder: 'Enter a description for the resource',
          rows: 8,
          required: true
        }
      }, {
        key: 'res_types',
        type: 'repeatSection',
        templateOptions: {
          btnText: 'Add Resource Type',
          fields: [{
            key: 'res_type',
            type: 'select',
            templateOptions: {
              label: 'Resource Type',
              required: true,
              options: [{
                name: 'Database Web UI',
                value: 'Database Web UI'
              }, {
                name: 'Database Web API',
                value: 'Database Web API'
              },
              {
                name: 'Tool Web UI',
                value: 'Tool Web UI'
              }, {
                name: 'Tool Web API',
                value: 'Tool Web API'
              }, {
                name: 'Command Line Tool',
                value: 'Command Line Tool'
              }, {
                name: 'Standalone Desktop Tool',
                value: 'Standalone Desktop Tool'
              }, {
                name: 'Script',
                value: 'Script'
              }, {
                name: 'Not Compiled Tool',
                value: 'Not Compiled Tool'
              }, {
                name: 'Tool Suite',
                value: 'Tool Suite'
              }, {
                name: 'Module',
                value: 'Module'
              },{
                name: 'Other',
                value: 'Other'
              }]
            }
          }, {
            key: 'res_type_other',
            type: 'input',
            templateOptions: {
              label: 'Specify Resource Type',
              type: 'text',
              required: true
            },
            hideExpression: "model.res_type==null || model.res_type!='Other'"
          }]
        }
      }, {
        key: 'bio_domains',
        type: 'repeatSection',
        templateOptions: {
          btnText: 'Add Biological/Clinical Domain',
          fields: [{
            key: 'bio_domain',
            type: 'select',
            templateOptions: {
              label: 'Biological/Clinical Domain',
              placeholder: 'Select a domain',
              required: true,
              options: [{
                name: 'Biomedical',
                value: 'Biomedical'
              }, {
                name: 'Epigenomics',
                value: 'Epigenomics'
              }, {
                name: 'Genomics',
                value: 'Genomics'
              }, {
                name: 'Metabolomics',
                value: 'Metabolomics'
              }, {
                name: 'Metagenomics',
                value: 'Metagenomics'
              }, {
                name: 'Proteomics',
                value: 'Proteomics'
              }, {
                name: 'Systems Biology',
                value: 'Systems Biology'
              }]
            }
          }]
        }
      }, {
        key: 'tags',
        type: 'tag',
        templateOptions: {
          type: 'text',
          label: 'Tags',
          placeholder: 'Enter the tag, then press \'ENTER\' (optional)',
          link: '/api/tag',
          attr: 'NAME',
          required: false
        }
      }

    ];

    vm.authorFields = [{
      key: 'authors',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add new author',
        required: true,
        fields: [{
          type: 'input',
          key: 'first_name',
          templateOptions: {
            label: 'First Name',
            placeholder: 'Enter the first name',
            required: true
          }
        }, {
          type: 'input',
          key: 'last_name',
          templateOptions: {
            label: 'Last Name',
            placeholder: 'Enter the last name',
            required: true
          }
        }, {
          type: 'input',
          key: 'author_email',
          validators: {
            emailAddr: emailValidator
          },
          templateOptions: {
            label: 'Author\'s Email',
            type: 'email',
            placeholder: 'Enter the author\'s email',
            required: true
          }


        }]
      }
    }, {
      key: 'maintainers',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add new maintainer',
        fields: [{
          type: 'input',
          key: 'first_name',
          templateOptions: {
            label: "Maintainer's First Name",
            placeholder: 'Enter first name of the maintainer',
            required: true
          }
        }, {
          type: 'input',
          key: 'last_name',
          templateOptions: {
            label: "Maintainer's Last Name",
            placeholder: 'Enter last name of the maintainer',
            required: true
          }
        }, {
          type: 'input',
          key: 'maintainer_email',
          templateOptions: {
            label: 'Maintainer\'s Email',
            type: 'email',
            placeholder: 'Enter the maintainer\'s email',
            required: true
          }


        }]
      }
    }, {
      key: 'institution',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add new institution',
        fields: [{
          key: 'inst_id',
          type: 'ui-select-single-search',
          hideExpression: 'model.missing',
          templateOptions: {
            optionsAttr: 'bs-options',
            ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
            label: 'Institution Name',
            valueProp: 'INST_ID',
            labelProp: 'ALIAS',
            otherProp: 'PRIMARY_NAME',
            placeholder: 'Enter the name of the institution',
            endpoint: '/api/institution',
            options: [],
            refresh: refreshInst,
            refreshDelay: 500
          }
        }, {
          key: 'new_institution',
          type: 'input',
          templateOptions: {
            type: 'text',
            label: "Insitution Name",
            placeholder: 'Enter the name of the institution',
            required: false
          },
          hideExpression: '!model.missing',
        }, {
          key: 'missing',
          type: 'input',
          templateOptions: {
            type: 'checkbox',
            label: "Can't find the institution?",
            value: 'false',
            required: false
          }
        }]
      }
    }];
    vm.pubFields = [{
      key: 'pub_tool_doi',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Resource DOI',
        placeholder: 'Enter DOI for the resource (if any)',
        value: '',
        required: false
      }
    }, {
      key: 'pub_primary_doi',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Primary Publication DOI',
        placeholder: 'Enter DOI for the primary publication',
        required: false
      }
    }, {
      key: 'pub_dois',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add new DOI',
        fields: [{
          type: 'input',
          key: 'pub_doi',
          templateOptions: {
            label: 'Publication DOI',
            placeholder: 'Enter DOI for the publication',
            required: false
          }
        }]
      }
    }];

    vm.linkFields = [{
      key: 'links',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add new link',
        fields: [{
          type: 'typeahead',
          key: 'link_name',
          templateOptions: {
            label: 'Link Title',
            placeholder: 'Homepage',
            options: ['Home Page', 'Wiki', 'Publication', 'Download', 'About', 'Contact'],
            required: true
          }
        }, {
          type: 'input',
          key: 'link_url',
          templateOptions: {
            label: 'Link URL',
            placeholder: 'http://www.homepage.com',
            required: true
          }


        }]
      }
    }];

    vm.devFields = [{
      key: 'res_code_url',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Source Code URL',
        placeholder: 'Enter a url for the source code repository',
        required: false
      }
    }, {
      key: 'dev_lang',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add Programming Language',
        fields: [{
          key: 'PRIMARY_NAME',
          type: 'ui-select-single-search',
          templateOptions: {
            optionsAttr: 'bs-options',
            ngOptions: 'option[to.valueProp] as option in to.options | filter: $select.search',
            label: 'Language Name',
            valueProp: 'PRIMARY_NAME',
            labelProp: 'ALIAS',
            otherProp: 'PRIMARY_NAME',
            placeholder: 'Enter the name of the language',
            endpoint: '/api/language',
            options: [],
            refresh: refreshInst,
            refreshDelay: 500
          }
        }]
      }
    }, {
      key: 'dev_platform',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add Platform',
        fields: [{
          type: 'select',
          key: 'platform_name',
          templateOptions: {
            label: 'Platform',
            placeholder: 'Enter the platform',
            options: [{
              name: 'Mac',
              value: 'Mac'
            }, {
              name: 'Windows',
              value: 'Windows'
            }, {
              name: 'Linux',
              value: 'Linux'
            }, {
              name: 'Web',
              value: 'Web'
            }],
            required: true
          }
        }]
      }
    }];
    vm.versionFields = [{
      key: 'latest_version',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Latest Version Number',
        placeholder: 'Enter the latest version number',
        required: false
      }
    }, {
      key: 'latest_version_date',
      type: 'datepicker',
      templateOptions: {
        label: 'Latest Version Date',
        type: 'text',
        datepickerPopup: 'dd-MMMM-yyyy'
      }
    }, {
      key: 'latest_version_desc',
      type: 'textarea',
      templateOptions: {
        label: 'Version Description',
        placeholder: 'Enter the description of the version (optional)',
        required: false
      }
    }, {
      key: 'prev_versions',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add previous version',
        fields: [{
          type: 'input',
          key: 'version_number',
          templateOptions: {
            label: 'Version Number',
            placeholder: 'Enter the version number',
            required: true
          }
        }, {
          key: 'version_date',
          type: 'datepicker',
          templateOptions: {
            label: 'Version Date',
            type: 'text',
            datepickerPopup: 'dd-MMMM-yyyy'
          }
        }, {
          type: 'textarea',
          key: 'version_description',
          templateOptions: {
            label: 'Version Description',
            placeholder: 'Enter the description of the version (optional)',
            required: false
          }
        }]
      }
    }];

    vm.ioFields = [{
      key: 'dependencies',
      type: 'tag',
      templateOptions: {
        type: 'text',
        label: 'Dependencies',
        placeholder: 'Enter the dependency, then press \'ENTER\'',
        link: 'https://maps.googleapis.com/maps/api/geocode/json',
        required: false
      }
    }, {
      key: 'input',
      type: 'tag',
      templateOptions: {
        type: 'text',
        label: 'Input File Type',
        placeholder: 'Enter the Input type',
        link: 'https://maps.googleapis.com/maps/api/geocode/json',
        required: false
      }
    }, {
      key: 'output',
      type: 'tag',
      templateOptions: {
        type: 'text',
        label: 'Output File Type',
        placeholder: 'Enter the output type',
        link: 'https://maps.googleapis.com/maps/api/geocode/json',
        required: false
      }
    }, {
      key: 'workflow',
      type: 'repeatSection',
      className: 'repeat_section',
      templateOptions: {
        btnText: 'Add Workflow',
        fields: [{
          type: 'input',
          key: 'upstream',
          templateOptions: {
            label: 'Upstream',
            placeholder: 'Enter the upstream resource',
            required: true
          }
        }, {
          type: 'input',
          key: 'downstream',
          templateOptions: {
            label: 'Downstream',
            placeholder: 'Enter the downstream resource',
            required: true
          }
        }]
      }
    }];

    vm.licenseFields = [{
      key: 'licenses',
      type: 'repeatSection',
      className: 'repeat_section',
      templateOptions: {
        btnText: 'Add License',
        fields:[{
          key: 'license',
          type: 'select',
          templateOptions: {
            label: 'License',
            options: [{
              name: 'Apache',
              value: 'Apache'
            }, {
              name: 'GNU Affero General Public License v3.0',
              value: 'GNU Affero General Public License v3.0'
            }, {
              name: 'GNU General Public License v2.0',
              value: 'GNU General Public License v2.0'
            }, {
              name: 'GNU General Public License v3.0',
              value: 'GNU General Public License v3.0'
            }, {
              name: 'MIT License',
              value: 'MIT License'
            }, {
              name: 'Artistic License 2.0',
              value: 'Artistic License 2.0'
            }, {
              name: 'Eclipse Public License 1.0',
              value: 'Eclipse Public License 1.0'
            }, {
              name: 'Simplified BSD',
              value: 'Simplified BSD'
            }, {
              name: 'New BSD',
              value: 'New BSD'
            }, {
              name: 'ISC License',
              value: 'ISC License'
            }, {
              name: 'GNU Lesser General Public License v2.1',
              value: 'GNU Lesser General Public License v2.1'
            }, {
              name: 'GNU Lesser General Public License v3.0',
              value: 'GNU Lesser General Public License v3.0'
            }, {
              name: 'Mozilla Public License 2.0',
              value: 'Mozilla Public License 2.0'
            }, {
              name: 'No License',
              value: 'No License'
            }, {
              name: 'Creative Commons Zero v1.0 Universal',
              value: 'Creative Commons Zero v1.0 Universal'
            }, {
              name: 'The Unlicense',
              value: 'The Unlicense'
            }, {
              name: 'Proprietary',
              value: 'Proprietary'
            }, {
              name: 'Other',
              value: 'Other'
            }]
          }
        }, {
          key: 'other_license',
          type: 'input',
          templateOptions: {
            type: 'text',
            label: 'Name of License',
            placeholder: 'Enter the name of your license',
            required: true
          },
          hideExpression: "(model.license!='Other' && model.license!='Proprietary')"
        }, {
          key: 'other_license_link',
          type: 'input',
          templateOptions: {
            type: 'text',
            label: 'Link to License',
            placeholder: 'Enter the link to the license',
            required: false
          },
          hideExpression: "(model.license!='Other' && model.license!='Proprietary')"
        },
        {
          key: 'other_license_desc',
          type: 'textarea',
          templateOptions: {
            label: 'Description of license',
            placeholder: 'Enter the description of the license (optional)',
            required: false
          },
          hideExpression: "(model.license!='Other' && model.license!='Proprietary')"
        }]
      }
    }];


    vm.fundingFields = [{
      key: 'funding',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add Funding Info',
        fields: [{
          type: 'input',
          key: 'funding_agency',
          templateOptions: {
            label: 'Funding Agency',
            placeholder: 'Enter the funding agency',
            required: true
          }
        }, {
          type: 'input',
          key: 'funding_grant',
          templateOptions: {
            label: 'Grant Number',
            placeholder: 'Enter the grant number',
            link: 'https://maps.googleapis.com/maps/api/geocode/json',
            required: true
          }
        }]
      }}, {
          key: 'bd2k',
          type: 'repeatSection',
          templateOptions: {
            btnText: 'Add BD2K Center',
            fields: [{
              type: 'select',
              key: 'center',
              templateOptions: {
                label: 'BD2K Center',
                options: [{
                  name: 'LINCS-DCIC',
                  value: 'LINCS-DCIC'
                },{
                  name: 'BDDS Center',
                  value: 'BDDS'
                },{
                  name: 'Center for Big Data in Translational Genomics',
                  value: 'BDTG'
                },{
                  name: 'CCD',
                  value: 'CCD'
                },{
                  name: 'CEDAR',
                  value: 'CEDAR'
                },{
                  name: 'CPCP',
                  value: 'CPCP'
                },{
                  name: 'MD2K',
                  value: 'MD2K'
                },{
                  name: 'ENIGMA',
                  value: 'ENIGMA'
                },{
                  name: 'KnowEng',
                  value: 'KnowEng'
                },{
                  name: 'Mobilize',
                  value: 'Mobilize'
                },{
                  name: 'PICSURE',
                  value: 'PICSURE'
                },{
                  name: 'HeartBD2K',
                  value: 'HeartBD2K'
                },
                {
                  name: 'Other',
                  value: 'Other'
                }]
              }
            }, {
              type: 'input',
              key: 'other',
              hideExpression: "model.center!='Other'",
              templateOptions: {
                label: 'BD2K Project Title',
                placeholder: 'Enter the name of the BD2K project',
                required: true
              }
            }]
          }
        }];




    function onNewSubmit() {
      $('#submit-recaptcha').hide();
      $('#submitModal').modal('toggle');
      $('#MessageModal').modal('toggle');
      var submit = {
        basic: vm.basic,
        authors: vm.authors,
        publication: vm.publication,
        links: vm.links,
        dev: vm.dev,
        version: vm.version,
        io: vm.io,
        license: vm.license,
        funding: vm.funding,
        recaptcha: $('#g-recaptcha-response').val()
      };
      $.post("/reg", submit)
        .done(function(data) {
          $('#messageLabel').text(data.message);
          if(data.status=='success'){
            var count = 0;
            $('#messageBody').text('Redirecting to tool page');
            setInterval(function(){
                count++;
                $('#messageBody').append('.  ');
                if(count > 3){
                  window.location.href = '/api/tool/'+data.id;
                }
              }, 1000);
          }else{
            $('#MessageModal').modal({
              backdrop: 'true',
              keyboard: 'true'
            });
          }
          // alert("Data Loaded: " + data.message);
        });
      //console.log(JSON.stringify(submit));
    };

    function onEditSubmit() {
      $('#submit-recaptcha').hide();
      $('#submitModal').modal('toggle');
      $('#MessageModal').modal('toggle');
      var submit = {
        basic: vm.basic,
        authors: vm.authors,
        publication: vm.publication,
        links: vm.links,
        dev: vm.dev,
        version: vm.version,
        io: vm.io,
        license: vm.license,
        funding: vm.funding
      };
      $.ajax({
          url: window.location.pathname,
          type: 'PUT',
          data: {orig:vm.orig, new: submit, recaptcha: $('#g-recaptcha-response').val()}
      }).done(function(data) {
        $('#messageLabel').text(data.message);
        if(data.status=='success'){
          var count = 0;
          $('#messageBody').text('Redirecting to tool page');
          setInterval(function(){
              count++;
              $('#messageBody').append('.  ');
              if(count > 2){
                window.location.href = '/api/tool/'+data.id;
              }
            }, 1000);
        }else{
          $('#MessageModal').modal({
            backdrop: 'true',
            keyboard: 'true'
          });
        }
      });
      //console.log(JSON.stringify(submit));
    };

    function refreshAddresses(address, field) {
      var promise;
      if (!address) {
        promise = $q.when({
          data: {
            results: []
          }
        });
      } else {
        var params = {
          address: address,
          sensor: false
        };
        var endpoint = 'https://maps.googleapis.com/maps/api/geocode/json';
        promise = $http.get(endpoint, {
          params: params
        });
      }
      return promise.then(function(response) {
        console.log(response.data.results);
        field.templateOptions.options = response.data.results;
      });
    };

    function refreshInst(inst, field, endpoint) {
      var promise;
      if (!inst) {
        promise = $q.when({
          data: []
        });
      } else {
        var params = {
          q: inst
        };

        promise = $http.get(endpoint, {
          params: params
        });
      }
      return promise.then(function(response) {
        field.templateOptions.options = response.data;
      });
    };

    function checkForm(){
      var error = false;
      var warn = false;

      var ErrMsg = function(err, msg){
        this.error = err;
        this.msg = msg;
      };

      ErrMsg.prototype.setErr = function(err){
        this.error = err;
      };

      var WarnMsg = function(warn, msg){
        this.warn = warn;
        this.msg = msg;
      };

      WarnMsg.prototype.setWarning = function(warn){
        this.warn = warn;
      };

      var errorMessages = [];
      errorMessages.push(new ErrMsg(false, "Please enter the resource name.")); // resource name
      errorMessages.push(new ErrMsg(false, "Please enter the description of the resource.")); // resource description
      errorMessages.push(new ErrMsg(false, "Please enter at least 1 link or a source code URL.")); // links
      errorMessages.push(new ErrMsg(false, "Please enter a name and/or URL for the link.")); // empty link
      errorMessages.push(new ErrMsg(false, "Cannot leave the resource type blank.")); // resource type
      errorMessages.push(new ErrMsg(false, "Cannot leave the biologial domain blank.")); // biological domain

      var warnMessages = [];
      warnMessages.push(new WarnMsg(false, "You did not enter the resource type(s).")); // resource type
      warnMessages.push(new WarnMsg(false, "You did not enter the biological domain(s).")); // biological domain
      warnMessages.push(new WarnMsg(false, "You did not enter any tags.")); // tags
      warnMessages.push(new WarnMsg(false, "You did not enter any author information).")); // authors
      warnMessages.push(new WarnMsg(false, "You did not enter any publication information.")); // publication
      warnMessages.push(new WarnMsg(false, "You did not enter any development information.")); // dev
      warnMessages.push(new WarnMsg(false, "You did not enter any version information.")); // version
      warnMessages.push(new WarnMsg(false, "You did not enter any input/output information.")); // input/output
      warnMessages.push(new WarnMsg(false, "You did not enter any license information.")); // license
      warnMessages.push(new WarnMsg(false, "You did not enter any funding information.")); // funding

      var html = "<div class='modal-body' style='height:75vh;overflow: auto'>";
      var message = "";

      // check for errors and warnings

      // basic section
      if(Object.keys(vm['basic']).length==0){
        errorMessages[0].setErr(true);
        errorMessages[1].setErr(true);
      }else{
        if(vm['basic']['res_name']==undefined){
          errorMessages[0].setErr(true);
        }
        if(vm['basic']['res_desc']==undefined){
          errorMessages[1].setErr(true);
        }
        if(vm['basic']['res_types']==undefined){
          warnMessages[0].setWarning(true);
        }else{
          vm['basic']['res_types'].forEach(function(type){
            if(type['res_type']==undefined || type['res_type']==null){
              errorMessages[4].setErr(true);
            }
          });
        }
        if(vm['basic']['bio_domains']==undefined){
          warnMessages[1].setWarning(true);
        }else{
          vm['basic']['bio_domains'].forEach(function(domain){
            if(domain['bio_domain']==undefined || domain['bio_domain']==null){
              errorMessages[5].setErr(true);
            }
          });
        }
        if(vm['basic']['tags']==undefined){
          warnMessages[2].setWarning(true);
        }else{
          vm['basic']['tags'].forEach(function(tag){
            if(tag['text']==undefined){
              warnMessages[2].setWarning(true);
            }
          });
        }
      }

      // link section
      if((Object.keys(vm['links']).length==0 || vm['links']['links']==undefined) &&
      (vm['dev']['res_code_url']==undefined || vm['dev']['res_code_url']=="")){
        console.log(1);
        errorMessages[2].setErr(true);
      }else if(vm['links']['links']){
        console.log(JSON.stringify(vm['links']));
        var atLeast1 = false;
        vm['links']['links'].forEach(function(link){
          if(link['link_name']==undefined || link['link_url']==undefined){
            if(atLeast1){
              errorMessages[3].setErr(true);
            } else {
              errorMessages[2].setErr(true);
            }
          }else{
            atLeast1 = true;
          }
        })
      }

      // authors section
      if(Object.keys(vm['authors']).length==0){
        warnMessages[3].setWarning(true);
      }
      if(Object.keys(vm['publication']).length==0){
        warnMessages[4].setWarning(true);
      }
      if(Object.keys(vm['dev']).length==0){
        warnMessages[5].setWarning(true);
      }
      if(Object.keys(vm['version']).length==0){
        warnMessages[6].setWarning(true);
      }
      if(Object.keys(vm['io']).length==0){
        warnMessages[7].setWarning(true);
      }
      if(Object.keys(vm['license']).length==0){
        warnMessages[8].setWarning(true);
      }
      if(Object.keys(vm['funding']).length==0){
        warnMessages[9].setWarning(true);
      }

      errorMessages.forEach(function(e){
        if(e['error']){
          error = true;
          message+="<li>"+e['msg']+"</li>";
        }
      });
      if(!error){
        warnMessages.forEach(function(w){
          if(w['warn']){
            warn = true;
            message+="<li>"+w['msg']+"</li>";
          }
        });
      }

      if(error || warn){
        message = "<ul>"+message+"</ul>";
      }else{
        message = "<pre id='sub_pre1'>Basic Information"+JSON.stringify(vm.basic, null, 4)+"</pre>"+
        "<pre id='sub_pre2'>Author Information"+JSON.stringify(vm.authors, null, 4)+"</pre>"+
        "<pre id='sub_pre3'>Publication Information"+JSON.stringify(vm.publication, null, 4)+"</pre>"+
        "<pre id='sub_pre4'>Related Links"+JSON.stringify(vm.links, null, 4)+"</pre>"+
        "<pre id='sub_pre5'>Development Information"+JSON.stringify(vm.dev, null, 4)+"</pre>"+
        "<pre id='sub_pre6'>Version History"+JSON.stringify(vm.version, null, 4)+"</pre>"+
        "<pre id='sub_pre7'>IO Information"+JSON.stringify(vm.io, null, 4)+"</pre>"+
        "<pre id='sub_pre8'>License Information"+JSON.stringify(vm.license, null, 4)+"</pre>"+
        "<pre id='sub_pre9'>Funding Information"+JSON.stringify(vm.funding, null, 4)+"</pre>";
      }

      html += message+"</div>";

      if(error){
        $('#submitModalLabel').text('Missing Information');
        html+= "<div class='modal-footer'>"+
                  "<button type='button' class='btn btn-default' data-dismiss='modal'>Okay</button>"+
                "</div>";
      }else if(warn){
        $('#submitModalLabel').text('Warning');
        $('#modal-submit').hide();
        $('#modal-warn').show();
      }else{
        $('#submitModalLabel').text('Submit Information');
        $('#modal-warn').hide();
        $('#modal-submit').show();
      }
      $('#pre-submit').html(html);
    };

    function passWarning() {
      $('#pre-submit').html(
        "<div class='modal-body' style='height:75vh;overflow: auto'>"+
        "<pre id='sub_pre1'>Basic Information"+JSON.stringify(vm.basic, null, 4)+"</pre>"+
        "<pre id='sub_pre2'>Author Information"+JSON.stringify(vm.authors, null, 4)+"</pre>"+
        "<pre id='sub_pre3'>Publication Information"+JSON.stringify(vm.publication, null, 4)+"</pre>"+
        "<pre id='sub_pre4'>Related Links"+JSON.stringify(vm.links, null, 4)+"</pre>"+
        "<pre id='sub_pre5'>Development Information"+JSON.stringify(vm.dev, null, 4)+"</pre>"+
        "<pre id='sub_pre6'>Version History"+JSON.stringify(vm.version, null, 4)+"</pre>"+
        "<pre id='sub_pre7'>IO Information"+JSON.stringify(vm.io, null, 4)+"</pre>"+
        "<pre id='sub_pre8'>License Information"+JSON.stringify(vm.license, null, 4)+"</pre>"+
        "<pre id='sub_pre9'>Funding Information"+JSON.stringify(vm.funding, null, 4)+"</pre>"+
        "</div>"
      );
      $('#submitModalLabel').text('Submit Information');
      $('#modal-warn').hide();
      $('#modal-submit').show();
      $('#submit-recaptcha').show();
    };

    function suggest(){
      var fields = {
        basic: vm.basic,
        authors: vm.authors,
        publication: vm.publication,
        links: vm.links,
        dev: vm.dev,
        version: vm.version,
        io: vm.io,
        license: vm.license,
        funding: vm.funding
      };
      $('#suggestions').text('');
      if(fields['basic']==undefined || fields['basic']['res_name']==undefined){
        $('#suggestions').text('Please enter the name of the resource.');
        return;
      }
      $('#loading').show();
      $.post("/suggest/query?field=pub_primary_doi", fields)
        .done(function(data) {
          $('#loading').hide();
          var json = JSON.parse(data);
          var text = "";
          if(json['suggestedDescription']!=undefined)
            text += '<strong>Pub. Description: </strong>'+
              json['suggestedDescription']+'<br>';
          if(json['suggestedUrl']!=undefined)
            text += '<strong>Pub. URL: </strong>'+
            json['suggestedUrl']+'<br>';

          $('#suggestions').append(text);
        });
        $.post("/suggest/query?field=res_code_url", fields)
          .done(function(data) {
            $('#loading').hide();

            var json = data;
            var text = "";

            if(json['suggestedDescription']!=undefined)
              text += '<strong>Github Description: </strong>'+
                json['suggestedDescription']+'<br>';
            if(json['suggestedUrl']!=undefined)
              text += '<strong>Github URL: </strong>'+
              json['suggestedUrl']+'<br>';
            if(json['suggestedLang']!=undefined)
              text += '<strong>Github Language: </strong>'+
              json['suggestedLang']+'<br>';
            if(json['suggestedLink']!=undefined && json['suggestedLink']['link_url']!=undefined)
              text += '<strong>Link: </strong>'+
              json['suggestedLink']['link_url']+' ('+json['suggestedLink']['link_name']+')<br>';

            $('#suggestions').append(text);
          });
        if(fields['dev']==undefined || fields['dev']['res_code_url']==undefined){
          return;
        }
        $.post("/suggest/query?field=license", fields)
          .done(function(data) {
            $('#loading').hide();
            var json = JSON.parse(data);

            if(json['suggestedLicense']!=undefined){
              $('#suggestions').append('<strong>License: </strong>'+
                json['suggestedLicense']+'<br>'
              );
            }
          });
          $.post("/suggest/query?field=versions", fields)
            .done(function(data) {
              $('#loading').hide();
              var json = JSON.parse(data);
              if(json['suggestedReleases']!=undefined){
                json['suggestedReleases'].forEach(function(rel){
                  $('#suggestions').append('<strong>Version: </strong>'+
                    rel['version_number']+' ('+rel['version_date']+')<br>'
                  );
                });
              }
            });
            $.post("/suggest/query?field=maintainers", fields)
              .done(function(data) {
                $('#loading').hide();

                var json = JSON.parse(data);
                if(json['suggestedMaintainer']!=undefined){
                  $('#suggestions').append('<strong>Maintainer: </strong>'+
                    json['suggestedMaintainer']['maintainer_name']+' ('+json['suggestedMaintainer']['maintainer_email']+')<br>'
                  );
                }
              });
    };

    function beforeSaveCheck(){
      if(true){
        $('#saveModalLabel').text('In Development');
      }
      else if(Object.keys(vm['basic']).length==0 ||
         vm['basic']['res_name']==undefined ||
         vm['basic']['res_desc']==undefined){
           $('#saveModalLabel').text('Missing Information');
           $('#pre-save').html("<center><b>Please enter a name and a description for the resource.</b></center>");
           $('#modal-save').hide();
           $('#modal-save-warn').show();
         }else{
           $('#saveModalLabel').text('Save');
           $('#pre-save').html("<center><b>Save resource?</b></center>");
           $('#modal-save').show();
           $('#modal-save-warn').hide();
         }
    }

    function save(){
      var submit = {
        basic: vm.basic,
        authors: vm.authors,
        publication: vm.publication,
        links: vm.links,
        dev: vm.dev,
        version: vm.version,
        io: vm.io,
        license: vm.license,
        funding: vm.funding,
        //recaptcha: $('#g-recaptcha-response').val()
      };
      $.post("/save", submit)
        .done(function(data) {
          console.log(data);
          //$('#messageLabel').text(data.message);
          if(data.status=='success'){

          }else{

          }
          // alert("Data Loaded: " + data.message);
        });

    };

    function init(id){
      $.get("/api/tool/"+id)
        .done(function(data) {
          console.log(data);
            vm.orig = JSON.parse(JSON.stringify(data));
            vm.basic = data['basic'];
            vm.authors = data['authors'];
            vm.publication = data['publication'];
            vm.links = data['links'];
            vm.dev = data['dev'];
            vm.version = data['version'];
            vm.license = data['license'];
            vm.funding = data['funding'];
            $scope.$apply();
        });
    }

  }

})();
