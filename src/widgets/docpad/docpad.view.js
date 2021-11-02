
/*
 * Copyright (c) 2021.  Reiner merz, ebit-company GmbH
 * License is based on MIT License , Can be freely changed as long as the original Author is mentioned.
 */

define([

    'csui/lib/underscore',                           // Cross-browser utility belt
    'csui/lib/marionette',                           // Marionetter
    'csui/lib/moment',                                  // the date/time lib in csui
    'ademo/widgets/docpad/impl/docpad.model.factory',  // Factory for the data model
    'csui/dialogs/node.picker/node.picker',             // the csui node picker
    'i18n!ademo/widgets/docpad/impl/nls/lang',          // Use localizable texts
    'hbs!ademo/widgets/docpad/impl/docpad',            // Template to render the HTML
    'css!ademo/widgets/docpad/impl/base',             // base Stylesheet needed for this view
    'css!ademo/widgets/docpad/impl/adv',                // adv stylesheet for this app
    'css!ademo/widgets/docpad/impl/print'               // print style sheet
], function ( _, Marionette, Moment, DocpadModelFactory, NodePicker, lang, template) {
    'use strict';

    // An application widget is a view, because it should render a HTML fragment
    let DocpadView = Marionette.ItemView.extend({
            // Outermost parent element should contain a unique widget-specific class
            className: 'ademo--docpad panel panel-default',
            initialize: function () {

                this.xAngle = 0;
                this.yAngle = 0;
                this.wheeldelta = 1.0;


            },
            events: {
                'click .picker': 'showThePicker',
                "click .printbtn": "printit"
            },
            printit: ()=> {window.print()},

            iso: s => {
                if (typeof s === "undefined") {
                    return " ";
                }
                let b = s.split(/\D+/);
                return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[5]));

            },
            toISO: now => {
                if (typeof now == "undefined") {
                    return " ";
                }
                let pad = n => n < 10 ? ' 0 ' + n : n;
                let d1 = new Date(now);
                return d1.getUTCFullYear() + ' - ' + pad(d1.getUTCMonth() + 1) + ' - ' + pad(d1.getUTCDate()) + ' T ' + pad(d1.getUTCHours()) + ': ' + pad(d1.getUTCMinutes()) + ': ' + pad(d1.getUTCSeconds()) + ' Z ';

            },

            showThePicker: function () {

                if (undefined === this) {
                    return;
                }
                let btn = document.querySelector(".btn");
                btn.classList.remove("animate-large");
                btn.classList.add("animate-large-backward");

                let nodePicker = new NodePicker({
                    connector: this.model.connector,
                    selectableTypes: [144],
                    dialogTitle: lang.pickerTitle,
                    selectButtonLabel: lang.selectPickerButtonLabel,
                    startLocation: 'enterprise.volume'
                });
                nodePicker.show()
                    .fail(function () {
                        console.error("Picker fails to show");
                    })
                    .done(_.bind(function (args) {
                        document.querySelector(".printbtn").classList.remove("hide");
                            document.querySelector("#content").classList.replace("hide", "display");
                            let node = args.nodes[0];
                            let id = node.attributes.id;
                            this.docname = node.attributes.name;
                            document.querySelector("#document1").innerHTML = this.docname;
                            this.loadDocumentThumbnail(id); // load the thumbnail and display it
                            this.loadDescriptions(node);    // load node data aud display it
                            this.loadNodeData(id);          // inquire form update data and display it
                        }, this)
                    );


            },
            loadDescriptions: function (node) {
                let base = document.querySelector(".face.one");

                if (base !== undefined) {
                    let create = this.iso(node.attributes.create_date).toLocaleString(navigator.language);
                    let modified = this.iso(node.attributes.modify_date).toLocaleString(navigator.language);
                    let createuser = node.attributes.create_user_id;
                    let modifyuser = node.attributes.modify_user_id;

                    let server = this.model.connector.connection.url;
                    let url = "http:" + server + "/members/" + createuser;
                    let urlm = "http:" + server + "/members/" + modifyuser;
                    let ticket = this.model.connector.connection.session.ticket;
// async/await is es8 so not useable so use fetch commands

                    fetch(urlm, {method: 'GET', headers: {"OTCSTicket": ticket}}
                    ).then(response => response.json()).then(data => {
                            node.moname = data.data.first_name + " " + data.data.middle_name + " " + data.data.last_name +
                                ("(") + data.data.id + (")");
                            fetch(url, {method: 'GET', headers: {"OTCSTicket": ticket}}
                            ).then(response => response.json())
                                .then(data => {
                                    let spbeg = "<span class='daterec'>";
                                    let spend = "</span>";
                                    this.createusername = data.data.first_name + " " + data.data.middle_name + " " + data.data.last_name +
                                        ("(") + data.data.id + (")");

                                    let content =
                                        "<span class=doc>" + node.attributes.name + spend+ "<br/><br/>" +
                                        "<span class='doclist'>" +
                                        "<p>" + lang.descNodeID+": " + node.attributes.id + "</p>" +
                                        "<p>"+lang.desDescription+":" + node.attributes.description + "</p>" +
                                        "<p>"+lang.desCreated+" <br/>&nbsp;" + spbeg + create + " "+lang.desBy+" &nbsp;" + this.createusername + spend + "</p>" +
                                        "<p>"+lang.desModified+" <br/>&nbsp;" + spbeg + modified + " "+lang.desBy+" &nbsp;" + node.moname + spend + "</p>" +
                                        "<p>"+lang.desType+"  &nbsp;&nbsp;&nbsp;&nbsp;-" + node.attributes.type_name + "</p>" +
                                        "<p>"+lang.desSize+" &nbsp;&nbsp;&nbsp;&nbsp;-" + node.attributes.size_formatted + "</p>";
                                    if (node.attributes.preferred_rendition_type !== undefined) {
                                        content = content +
                                            "<p>"+lang.desprefrend+" " + node.attributes.preferred_rendition_type[0] + "</p>";
                                    }
                                    base.innerHTML = content + spend;
                                });

                        }
                    );


                }
            }
            ,
            loadDocumentThumbnail: function (id) {
                // thumbnail loaded with ancient XMLHttpRequest
                let xhttp = new XMLHttpRequest();
                let server = this.model.connector.connection.url + "/nodes/";
                let url = "http:" + server + id + "/thumbnails/medium/content";
                xhttp.responseType = 'blob';
                xhttp.onload = _.bind(function () {
                    if (xhttp.status === 200) {
                        let URL = window.URL || window.webkitURL;
                        let downloadUrl = URL.createObjectURL(xhttp.response);
                        let text, content;
                        let img = document.createElement("img");
                        img.src = downloadUrl;
                        img.classList.add("thumbnails");
                        img.style.zIndex = "auto";

                        let base = document.querySelector(".face.two");
                        content = "<div class=doc  >" + lang.thumbnail+ "<br/></div>";
                        let isText = document.querySelector("#Thumbnail");
                        if (isText === null) {
                            text = document.createElement("div");
                            text.id = "Thumbnail";

                        } else {
                            text = isText;
                        }

                        text.innerHTML = content;
                        base.appendChild(text);
                        text.appendChild(img);
                        let mun = text.childNodes;

                        if (mun.length === 4) {
                            let oldnode = text.firstChild;
                            text.removeChild(oldnode);
                        }

                        setTimeout(function () {
                            URL.revokeObjectURL(downloadUrl);
                        }, 100); // cleanup
                    } else {
                        console.error("Error on Thumbnail: " + xhttp.status);
                    }
                }, this);
                xhttp.open("GET", url, true);
                xhttp.setRequestHeader("OTCSTicket", this.model.connector.connection.session.ticket);
                xhttp.send();

            },
            loadNodeData: function (nodeid) {
                //load all nodedata via forms/nodes/update
                // use XMLHttpRequest
                let xhttp = new XMLHttpRequest();
                let server = this.model.connector.connection.url;
                let url = "http:" + server + "/forms/nodes/update?id=" + nodeid;
                xhttp.responseType = "";
                xhttp.onload = function () {
                    if (xhttp.status === 200) {

                        // the time functions inside this callback scope. with a bind command the original
                        // isoin functions can be used
                        let isoin = (s) => {
                            if (null === s) {
                                return;
                            }
                            if (typeof s == "undefined") {
                                return " ";
                            }
                            let b = s.split(/\D+/);
                            return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[5]));

                        };
                        let data = JSON.parse(this.response);
// Categories with values on Face three from  forms[1]data three
                        let base = document.querySelector(".face.three");
                        if (base !== undefined) {
                            let content = "<span class=doc>" + lang.catCategories;
                            let categories = data.forms[1].schema.properties;
                            let vals = data.forms[1].data;
                            let keys = [], datakey = [];
                            Object.keys(categories).forEach((key) => {
                                let value = categories[key];
                                keys.push(value);
                            });
                            Object.keys(vals).forEach((val) => {
                                let value = vals[val];
                                datakey.push(value);
                            });
                            content = content + " (" + keys.length + ")" + "</span>";
                            if (keys.length===0) {
                                content = content+"<br/>"+ lang.catNoCategories;
                            } else {
                                // categories found, populate the card
                                for (let i = 0; i < keys.length; i++) {
                                    content = content + "<br/>" +
                                        "<span class='catname'>" + "<br/>" + keys[i].title + "</span>";
                                    content = content + "<span class='doclist'>";
                                    let cats = keys[i].properties;
                                    let catskeys = [], catsids = [];
                                    Object.keys(cats).forEach((key) => {
                                        let value = cats[key];
                                        catskeys.push(value);
                                        catsids.push(key);
                                    });
                                    let cindex = 0;
                                    catskeys.forEach((item, index) => {
                                        if (index === 0) {
                                            return;
                                        }

                                        let title = catskeys[index - 1].title;
                                        let type = catskeys[index - 1].type;
                                        if (null == title) {
                                            cindex++;
                                        } else {
                                            let value = catsids[index - 1];
                                            let datavalue = datakey[cindex];

                                            content = content + "<br/>" + "-" + title;
                                            let kkval = datavalue[value];
                                            if (type === "date") {
                                                kkval = isoin(kkval).toLocaleString(navigator.language);
                                            }
                                            content = content + "---" + kkval;
                                        }

                                    });
                                    content = content + "</span>";
                                }
                            }

                            base.innerHTML = content;
                        }
// Security Clearances on Face four from forms[7].data
                        let sec = document.querySelector(".face.four");
                        if (sec !== undefined) {
                            let content = "<span class=doc>" + lang.secTitle +
                                "</span><br/>";
                            let supplemental = data.forms[7].data.supplemental_markings;
                            if (supplemental.length > 0) {
                                content = content + "<br/><span class='supplemental'>" + lang.secMarkings + "</span>";

                                Object.keys(supplemental).forEach((key) => {
                                    let value = supplemental[key];
                                    content = content + "<br/>" + value;
                                });
                                content = content +
                                    "<br/><span class='doclist'>"+lang.secLevel+" = "
                                    + data.forms[7].data.clearance_level + "</span>";
                            }
                            sec.innerHTML = content;
                        }
                        // Records Management in Face file from forms[6] data
                        let rmi = document.querySelector(".face.five");

                        if (rmi !== undefined) {
                            let content = "<span class='doc'>" + lang.recmantitle +
                                "</span><br/><br/>";
                            let rmbase = data.forms[6].data;

                            let out = "";
                            if (null === rmbase.name) {
                                out = "<p> "+lang.recmanNo+"</p>";
                            } else {
                                out = "<p>" + lang.recmanName+" = " + rmbase.name + "</p>" +
                                    "<p>" + lang.recmanrsi+" = " + rmbase.rsi + "</p>" +
                                    "<p>" + lang.recmanEssential+" = " + rmbase.essential + "</p>" +
                                    "<p>" + lang.recmanFileNumber+" = " + rmbase.file_number + "</p>" +
                                    "<p>" + lang.recmanDate+" = " + isoin(rmbase.record_date).toLocaleString(navigator.language) + "</p>" +
                                    "<p>" + lang.recmanOriginator+" = " + rmbase.originator + "</p>"
                                ;
                            }

                            rmi.innerHTML = content + "<span class='doclist'>" + out + "</span>";
// Versions not implemented in the forms REST API in 21.3
                            let versions = document.querySelector(".face.six");
                            let contentv = "";
                            let versionbase = data.forms[10].data;
                            if (versionbase === undefined) {
                                contentv = "<span class=doc>" + lang.verNo+
                                    "</span><br/><br/>";
                                versions.innerHTML = contentv;

                            } else {
                                let out = "<span class=doc>" + lang.verNo +
                                    "</span><br/><br/>";
                                contentv = "<p>"+lang.vernotver+"</p>";
                                versions.innerHTML = out + "<span class='doclist'>" + contentv + "</span>";
                            }

                        }
                    }
                };
                xhttp.open("GET", url, true);
                xhttp.setRequestHeader("OTCSTicket", this.model.connector.connection.session.ticket);
                xhttp.send();
            },
            loadPhoto: function () {
                let server = this.model.connector.connection.url;
                server = server.substr(0, server.search("api/v1"));
                let url = server + this.photo_url;
                let ticket = this.model.connector.connection.session.ticket;
                fetch(url, {method: 'GET', headers: {"OTCSTicket": ticket}})
                    .then(response => response.blob())
                    .then(function (myBlob) {
                            const URL = window.URL || window.webkitURL;
                            let photo = URL.createObjectURL(myBlob);
                            let img = document.createElement("img");
                            img.classList.add("photo");
                            img.src = photo;
                            document.querySelector("#photo").appendChild(img);
                            setTimeout(() => {
                                URL.revokeObjectURL(photo);
                            }, 100); // cleanup
                        }
                    );
            },
        // the clock, displaying the time every 1 sec
            clock: () => {
                let time = Moment().format('h:mm:ss a');
                let v = document.querySelector("#time");
                if (null === v) {
                    return;
                }
                document.querySelector("#time").textContent = time+" ";

            },
            onDomRefresh: function () {
                this.clock();
                this.clockid = setInterval(this.clock, 1000);
            },
            onRender: function () {
                let man = document.querySelector(".main");
                if (null === man) {
                    return;
                }
                let btn = document.querySelector(".btn");
                let hdr = document.querySelector(("#document1"));
                if (hdr.innerHTML === "") {
                    btn.classList.add("animate-large");
                }

                if (typeof this.photo_url != 'undefined') {
                    this.loadPhoto();
                }

            },
            // Base-Template method rendering the HTML for the view
            template: template,

            // Mix additional properties in the template input data
            templateHelpers: function () {
                let message= this.model.get('id') ?
                    _.str.sformat(lang.helloMessage,
                        this.model.get('first_name'),
                        this.model.get('last_name')) :
                    lang.waitMessage;
              //  let message = lang.helloMessage +
                //        this.model.get('first_name') + " "+ this.model.get('last_name');
                let fullname = this.model.get('first_name') + " "
                    + this.model.get('middle_name') + " " + this.model.get('last_name');
                this.photo_url = this.model.get('photo_url');
                let mydate = Moment().format("DD-MM-YYYY");
                const sessionexpire = this.model.connector.connection.session.expires;
                return {
                    message: message,
                    photo_url: this.photo_url,
                    mydate: mydate,
                    superscriptsize: '10',
                    sessionexpire: sessionexpire,
                    email: this.model.get('business_email'),
                    phone: this.model.get('business_phone'),
                    fax: this.model.get('business_fax'),
                    office: this.model.get('office_location'),
                    title: this.model.get('title'),
                    fullname: fullname,
                    sessionexpires: lang.sessionexpires,
                    selectadocument: lang.selectadocument,
                    bphone: lang.phone,
                    bfax: lang.fax,
                    bemail: lang.email,
                    boffice: lang.office,
                    seldoc: lang.seldoc,
                    printdoc: lang.printdoc

                };
            },
            constructor: function DocpadView(options) {
                // load the logged in user using a standard Backbone MOdedl
                options.model = options.context.getModel(DocpadModelFactory);
                Marionette.ItemView.prototype.constructor.call(this, options);
                this.listenTo(this.model, 'change', this.render);
            }
        })
    ;

    return DocpadView;
})
;


