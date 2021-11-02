# DocpadView -- A Document launch pad

Shows a panel displaying the currend logged user and allows the user to select a document in the content server.
The data and the thumbnail of this document then is displayed on the panel. A separate print stylesheet allows the printing of 
the displayed data.
Sample usage:

    // Wrap the widget placeholder
    var region = new Marionette.Region(
          el: '#widget'
        }),
        // Create the data managing context
        context = new PageContext(),
        // Create the widget instance
        view = new DocpadView({
          context: context
        });

      // Show the widget on the page
      region.show(view);
      // Load data from the server
      context.fetch();

### Connect to a real server
To change the sample to use an actual user and server: 
1. Remove the `session` section from the `require.config`.
2. Edit the `url` field in the `require.config` to point to an actual server. 
3. Remove the code referring to the `mock` object.
 
### Modify the language
The localized messages to display is defined in the `impl/nls/root/lang.js` file.
