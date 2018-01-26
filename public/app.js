var app = angular.module('aslFingerSpelling', []);

//Taken from here: not sure about the license, I think it might be small enough to not matter: http://stackoverflow.com/questions/22754393/in-a-chrome-app-using-angularjs-can-i-use-the-ngsrc-directive-directly-for-inte
app.config([
  '$compileProvider',
  function ($compileProvider) {
    //  Default imgSrcSanitizationWhitelist: /^\s*(https?|ftp|file):|data:image\//
    //  chrome-extension: will be added to the end of the expression
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension):|data:image\//);
  }
]);

app.controller('MainController', ['$scope', '$timeout', 'FingerSpellingService',
function($scope, $timeout, FingerSpellingService) {

  FingerSpellingService.getImages();

  $scope.letters = '';
  $scope.showPlayButton = false;
  $scope.showSpeedMenu = false;
  $scope.CurrentDate = new Date();
  $scope.restaurantes = [];
  $scope.mostraRestMtg = false;
  $scope.mostraRest = false;

  window.setTimeout(function() {
    $scope.letters = $scope.letters + '.';
}, 3000);

  var currentTimeout;
  $scope.$watch('letters', function() {
    $timeout.cancel(currentTimeout);
    $scope.showPlayButton = false;
    var lowercase = $scope.letters.toLowerCase();

    if (!isValidASLCharacter(lowercase[lowercase.length - 1])) {

      if (FingerSpellingService.images['transparent']) {
        $scope.imgSrc = 'data:image/png;base64,' + FingerSpellingService.images['transparent'];

      }
      else {
        $scope.imgSrc = 'images/transparent.png';
      }

      return;
    }

    currentTimeout = $timeout(function() {
      if ($scope.letters !== '') {
        $scope.showPlayButton = true;
      }
    }, $scope.medium);

    $scope.imgSrc = 'data:image/png;base64,' + FingerSpellingService.images[lowercase[lowercase.length - 1]];
  });

  $scope.fast = 300;
  $scope.medium = 800;
  $scope.slow = 1300;
  $scope.speed = $scope.medium;
  $scope.speedText = 'medium';

  $scope.play = function() {

    $scope.showPlayButton = false;

    var newLetters = $scope.letters;
    newLetters = newLetters.toLowerCase();

    if(isValidASLCharacter(newLetters[0])) {
      $scope.imgSrc = 'data:image/png;base64,' + FingerSpellingService.images[newLetters[0]];
      var chatInput = document.getElementById('chatInput');
      chatInput.setSelectionRange(0, 1);
    }

    if (newLetters[1]) {
      showDelayed(newLetters, 1);

      $timeout(function() {
        $('#handImage').css('opacity', '0');
      }, $scope.speed - 100);
    }
  };

  var returnCount = 0;
  function showDelayed(newLetters, index) {
    currentTimeout = $timeout(function() {

      if (!isValidASLCharacter(newLetters[index])) {
        showDelayed(newLetters, index + 1);
        return;
      }

      $('#handImage').css('opacity', '1');
      $scope.imgSrc = 'data:image/png;base64,' + FingerSpellingService.images[newLetters[index]];

      var chatInput = document.getElementById('chatInput');
      chatInput.setSelectionRange(index, index + 1);

      index = index + 1;
      if (newLetters[index]) {
        showDelayed(newLetters, index);

        $timeout(function() {
          $('#handImage').css('opacity', '0');
        }, $scope.speed - 100);
      }
      else {
        currentTimeout = $timeout(function() {
          $scope.showPlayButton = true;
          chatInput.setSelectionRange(newLetters.length, newLetters.length);
          $scope.showWeather = true;
        }, $scope.medium);
      }
    }, $scope.speed);
  }



        $scope.restaurantes = [
          {
            nome: 'Hortolandia III',
            tipo: 'Self-Service',
            local: 'perto',
            fidelidade: true
          },
          {
            nome: 'Cainelli',
            tipo: 'A la carte',
            local: 'perto',
            fidelidade: false
          },
          {
            nome: 'Sala Vip',
            tipo: 'Self-Service',
            local: 'perto',
            fidelidade: true
          },
          {
            nome: 'GR',
            tipo: 'A la carte',
            local: 'dentro da IBM',
            fidelidade: false
          },
          {
            nome: 'Lagoa',
            tipo: 'A la carte',
            local: 'longe',
            fidelidade: true
          },
          {
            nome: 'Shopping',
            tipo: 'Praça de Alimentação',
            local: 'longe',
            fidelidade: false
          }
        ]


    $scope.restaurantesMtg = [
      {
        nome: 'GR',
        tipo: 'A la carte',
        local: 'dentro da IBM',
        fidelidade: false
      },
      {
        nome: 'Hortolandia III',
        tipo: 'Self-Service',
        local: 'perto',
        fidelidade: true
      },
      {
        nome: 'Sala Vip',
        tipo: 'Self-Service',
        local: 'perto',
        fidelidade: true
      },
      {
        nome: 'Cainelli',
        tipo: 'A la carte',
        local: 'perto',
        fidelidade: false
      }
    ]


  $scope.speedMenuItemClick = function(speedText) {

    $scope.showSpeedMenu = !$scope.showSpeedMenu;

    if (speedText === 'fast') {
      $scope.speed = $scope.fast;
      $scope.speedText = speedText;
      return;
    }

    if (speedText === 'medium') {
      $scope.speed = $scope.medium;
      $scope.speedText = speedText;
      return;
    }

    if (speedText === 'slow') {
      $scope.speed = $scope.slow;
      $scope.speedText = speedText;
      return;
    }
  }

  function isValidASLCharacter(c) {
    var validASLCharacters = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z'
    ];

    if (validASLCharacters.indexOf(c) === -1) {
      return false;
    }

    return true;
  }
}
]);

app.factory('FingerSpellingService', ['$http',

function($http) {
  var o = {
    images: {}
  };

  var validASLCharacters = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ];

  o.getImages = function() {

    var transparentPromise = $http.get('images/transparent.png', { responseType: 'arraybuffer' });

    transparentPromise
    .success(function(data, status, headers, config) {
      var stringUint8Array = new Uint8Array(data);
      var base64Data = btoa(String.fromCharCode.apply(null, stringUint8Array));
      o.images.transparent = base64Data;
    })
    .error(function(data, status, headers, config) {});

    validASLCharacters.forEach(function(element) {

      o.images[element] = '';

      var promise = $http.get('images/' + element + '.png', { responseType: 'arraybuffer' });

      promise
      .success(function(data, status, headers, config) {
        var stringUint8Array = new Uint8Array(data);
        var base64Data = btoa(String.fromCharCode.apply(null, stringUint8Array));
        o.images[element] = base64Data;
      })
      .error(function(data, status, headers, config) {});
    });
  };

  return o;
}
]);
