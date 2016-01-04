(function() {

  'use strict';

  var app = angular.module('formlyApp', ['formly', 'formlyBootstrap', 'ui.bootstrap', 'ngTagsInput'], function config(formlyConfigProvider) {
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

  app.run(function(formlyConfig) {
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

    console.log(ngModelAttrs);

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
      name: 'typeahead',
      templateUrl: 'typeahead.html',
      controller: ['$scope', '$http', function($scope, $http) {
        $scope.getItems = function(val, url) {
          console.log($scope.link);
          return $http.get(url, {
            params: {
              address: val,
              sensor: false
            }
          }).then(function(response) {
            return response.data.results.map(function(item) {
              return item.formatted_address;
            });
          });
        };
      }]
    });
    formlyConfig.setType({
      name: 'tag',
      templateUrl: 'tags.html',
      controller: ['$scope', '$http', function($scope, $http) {
        $scope.getItems = function(query, url) {
          return $http.get(url, {
            params: {
              address: query,
              sensor: false
            }
          }).then(function(response) {
            return response.data.results.map(function(item) {
              //console.log(item);
              return item.formatted_address;
            });
          });
        };
      }]
    });



    function camelize(string) {
      string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
        return chr ? chr.toUpperCase() : '';
      });
      // Ensure 1st char is always lowercase
      return string.replace(/^([A-Z])/, function(match, chr) {
        return chr ? chr.toLowerCase() : '';
      });
    }
  })
  app.controller('MainController', MainController);

  function MainController($http, $q) {

    var vm = this;
    vm.onSubmit = onSubmit;

    // The model object that we reference
    // on the <formly-form> element in index.html
    vm.basic = {};
    vm.authors = {};
    vm.publication = {};
    vm.links = {};
    vm.dev = {};
    vm.version = {};
    vm.versionOptions = {};
    vm.io = {};
    vm.license = {};
    vm.funding = {};



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
          placeholder: 'Enter the URL for the logo image',
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
                name: 'Database',
                value: 'Database'
              }, {
                name: 'Widget',
                value: 'Widget'
              }, {
                name: 'Algorithm',
                value: 'Algorithm'
              }, {
                name: 'Tool Suite',
                value: 'Tool Suite'
              }, {
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
          placeholder: 'Enter the tag, then press \'ENTER\'',
          link: 'https://maps.googleapis.com/maps/api/geocode/json',
          required: false
        }
      }

    ];

    vm.authorFields = [{
      key: 'authors',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add new author',
        fields: [{
          type: 'typeahead',
          key: 'author_name',
          templateOptions: {
            label: 'Author Name',
            placeholder: 'Enter name of the author',
            link: 'https://maps.googleapis.com/maps/api/geocode/json',
            required: true
          }
        }, {
          type: 'input',
          key: 'author_email',
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
          type: 'typeahead',
          key: 'maintainer_name',
          templateOptions: {
            label: 'Maintainer Name',
            placeholder: 'Enter name of the maintainer',
            link: 'https://maps.googleapis.com/maps/api/geocode/json',
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
          type: 'input',
          key: 'link_name',
          templateOptions: {
            label: 'Link Title',
            placeholder: 'Homepage',
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
          type: 'input',
          key: 'lang_name',
          templateOptions: {
            label: 'Programming Language',
            placeholder: 'Enter the programming language',
            required: true
          }
        }]
      }
    }, {
      key: 'dev_platform',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add Platform',
        fields: [{
          type: 'input',
          key: 'platform_name',
          templateOptions: {
            label: 'Platform',
            placeholder: 'Enter the platform',
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
          type: 'input',
          key: 'version_description',
          templateOptions: {
            label: 'Version Description',
            placeholder: 'Enter the description of the version',
            required: false
          }
        }, {
          key: 'version_date',
          type: 'datepicker',
          templateOptions: {
            label: 'Version Date',
            type: 'text',
            datepickerPopup: 'dd-MMMM-yyyy'
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
      key: 'license_type',
      type: 'radio',
      templateOptions: {
        label: 'Type of License',
        options: [{
          name: 'Proprietary',
          value: 0
        }, {
          name: 'Open Source',
          value: 1
        }],
        required: true
      },
    }, {
      key: 'license',
      type: 'select',
      hideExpression: "model.license_type!=1",
      templateOptions: {
        label: 'License',
        options: [{
          name: 'Academic Free',
          value: 'Academic Free'
        }, {
          name: 'Apache',
          value: 'Apache'
        }, {
          name: 'Apple Public Source',
          value: 'Apple Public Source'
        }, {
          name: 'Artistic',
          value: 'Artistic'
        }, {
          name: 'Berkeley Database',
          value: 'Berkeley Database'
        }, {
          name: 'BSD',
          value: 'BSD'
        }, {
          name: 'Boost Software',
          value: 'Boost Software'
        }, {
          name: 'Common Development and Distribution',
          value: 'Common Development and Distribution'
        }, {
          name: 'Common Public',
          value: 'Common Public'
        }, {
          name: 'Eclipse Public',
          value: 'Eclipse Public'
        }, {
          name: 'Educational Community',
          value: 'Educational Community'
        }, {
          name: 'EUPL',
          value: 'EUPL'
        }, {
          name: 'GNU Affero General Public',
          value: 'GNU Affero General Public'
        }, {
          name: 'GNU General Public Licence (GPL)',
          value: 'GPL'
        }, {
          name: 'IBM Public',
          value: 'IBM Public'
        }, {
          name: 'Intel Open Source',
          value: 'Intel Open Source'
        }, {
          name: 'ISC',
          value: 'ISC'
        }, {
          name: 'MIT',
          value: 'MIT'
        }, {
          name: 'Mozilla Public',
          value: 'Mozilla Public'
        }, {
          name: 'Open Software',
          value: 'Open Software'
        }, {
          name: 'OpenSSL',
          value: 'OpenSSL'
        }, {
          name: 'PHP',
          value: 'PHP'
        }, {
          name: 'Python Software Foundation',
          value: 'Python Software Foundation'
        }, {
          name: 'MIT',
          value: 'MIT'
        }, {
          name: 'W3C Software',
          value: 'W3C Software'
        }, {
          name: 'XCore Open Source',
          value: 'XCore Open Source'
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
        required: false
      },
      hideExpression: "(model.license_type==1 && model.license!='Other') || model.license_type==null"
    }, {
      key: 'other_license_link',
      type: 'input',
      templateOptions: {
        type: 'text',
        label: 'Link to License',
        placeholder: 'Enter the link to the license',
        required: false
      },
      hideExpression: "(model.license_type==1 && model.license!='Other') || model.license_type==null"
    }, {
      key: 'license_version',
      type: 'input',
      templateOptions: {
        type: 'number',
        label: 'License Version',
        placeholder: 'Enter the version number',
        required: false
      },
      hideExpression: "model.license_type==null || model.license_type==0"
    }];


    vm.fundingFields = [{
      key: 'funding',
      type: 'repeatSection',
      templateOptions: {
        btnText: 'Add Funding Info',
        fields: [{
          type: 'typeahead',
          key: 'funding_agency',
          templateOptions: {
            label: 'Funding Agency',
            placeholder: 'Enter the funding agency',
            link: 'https://maps.googleapis.com/maps/api/geocode/json',
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
      }
    }];




    function onSubmit() {
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
      $.post("/create", submit)
        .done(function(data) {
          alert("Data Loaded: " + data);
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
        field.templateOptions.options = response.data.results;
      });
    }

  }

})();
