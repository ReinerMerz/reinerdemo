
/*
 * Copyright (c) 2021.  Reiner merz, ebit-company GmbH
 * License is based on MIT License , Can be freely changed as long as the original Author is mentioned.
 */
// the factory for the model
define([
  'csui/utils/contexts/factories/factory',   // Factory base to inherit from
  'csui/utils/contexts/factories/connector', // Factory for the server connector
  'ademo/widgets/docpad/impl/docpad.model'     // Model to create the factory for
], function (ModelFactory, ConnectorFactory, DocpadModel) {
  'use strict';

  var DocpadModelFactory = ModelFactory.extend({

    propertyPrefix: 'docpad',

    constructor: function DocpadModelFactory(context, options) {
      ModelFactory.prototype.constructor.apply(this, arguments);

      // Obtain the server connector from the application context to share
      // the server connection with the rest of the application; include
      // the options, which can contain settings for dependent factories
      var connector = context.getObject(ConnectorFactory, options);

      // Expose the model instance in the `property` key on this factory
      // instance to be used by the context
      this.property = new DocpadModel(undefined, {
        connector: connector
      });
    },

    fetch: function (options) {
      // Just fetch the model exposed by this factory
      return this.property.fetch(options);
    }
  });

  return DocpadModelFactory;
});
