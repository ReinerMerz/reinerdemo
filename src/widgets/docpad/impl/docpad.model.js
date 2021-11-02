

/*
 * Copyright (c) 2021.  Reiner merz, ebit-company GmbH
 * License is based on MIT License , Can be freely changed as long as the original Author is mentioned.
 */

define([
  'csui/lib/backbone',
  'csui/utils/url'
], function (Backbone, Url) {
  'use strict';

  let DocpadModel = Backbone.Model.extend({
    defaults: {
      name: 'Unnamed'
    },

    //
    constructor: function DocpadModel(attributes, options) {
      Backbone.Model.prototype.constructor.apply(this, arguments);

      // Enable this model for communication with the CS REST API
      if (options && options.connector) {
        options.connector.assignTo(this);
      }
    },
    // Computes the REST API URL using the connection options
    // /auth returns information about the authenticated user
    // usage of => not possible because of this is used for urls
    url:  function () {
      return Url.combine(this.connector.connection.url, '/auth');
    } ,

    parse:(response) =>  response.data

  });

  return DocpadModel;
});
