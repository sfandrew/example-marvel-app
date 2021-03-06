var PageTitleHelpers = require('app/helpers/page-title');

var charactersTemplate = require('marko')
  .load(require.resolve('app/views/pages/characters/template.marko'));
var charactersContentTemplate = require('marko')
  .load(require.resolve('app/views/pages/characters/content.marko'));
var characterTemplate = require('marko')
  .load(require.resolve('app/views/pages/character/template.marko'));
var characterContentTemplate = require('marko')
  .load(require.resolve('app/views/pages/character/content.marko'));
var notFoundTemplate = require('marko')
  .load(require.resolve('app/views/pages/not-found/template.marko'));

exports.index = function(req, res, next) {
  var marvel = req.marvel;
  var spf = req.query.spf;
  var offset = req.query.offset;

  marvel.findAllCharacters({
    offset: offset
  })
  .then(function(result) {
    var pageTitle = PageTitleHelpers.makeTitle('Characters');
    var templateData = {
      $global: req.templateGlobals,
      pageTitle: pageTitle,
      pagination: result.pagination,
      characters: result.characters
    };

    if (spf === 'navigate') {
      return charactersContentTemplate.render(templateData, function(err, html) {
        if (err) {
          return next(err);
        }

        res.send({
          title: pageTitle,
          attr: {
            'spf-navbar-characters': {class: 'active'},
            'spf-navbar-comics': {class: ''}
          },
          body: {
            'spf-content': html
          }
        });
      });
    }

    charactersTemplate.render(templateData, res);
  })
  .catch(next);
};

exports.show = function(req, res, next) {
  var marvel = req.marvel;
  var id = req.params.id;
  var spf = req.query.spf;

  marvel.findCharacter(id)
  .then(function(result) {
    var pageTitle = PageTitleHelpers.makeTitle(result.character.name);
    var templateData = {
      $global: req.templateGlobals,
      pageTitle: pageTitle,
      character: result.character
    };

    if (spf === 'navigate') {
      return characterContentTemplate.render(templateData, function(err, html) {
        if (err) {
          return next(err);
        }

        res.send({
          title: pageTitle,
          attr: {
            'spf-navbar-characters': {class: 'active'},
            'spf-navbar-comics': {class: ''}
          },
          body: {
            'spf-content': html
          }
        });
      });
    }

    characterTemplate.render(templateData, res);
  })
  .catch(function(err) {
    if (err.status === 404) {
      res.status(404);
      return notFoundTemplate.render({$global: req.templateGlobals}, res);
    }

    next(err);
  });
};
