      /* exported gapiLoaded */
      /* exported gisLoaded */
      /* exported handleAuthClick */
      /* exported handleSignoutClick */

      // TODO(developer): Set to client ID and API key from the Developer Console
      const CLIENT_ID = '12831201738-vobo8jvdgs1qq3hd41rgvu3see4qjl42.apps.googleusercontent.com';
      const API_KEY = 'AIzaSyBjgAdigLwxm6WjVwFc3wL4tIDILIgeqDM';

      // Discovery doc URL for APIs used by the quickstart
      const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      const SCOPES = 'https://www.googleapis.com/auth/calendar';

      let tokenClient;
      let gapiInited = false;
      let gisInited = false;

      document.getElementById('authorize_button').style.visibility = 'hidden';
      document.getElementById('signout_button').style.visibility = 'hidden';

      /**
       * Callback after api.js is loaded.
       */
      function gapiLoaded() {
        gapi.load('client', initializeGapiClient);
      }

      /**
       * Callback after the API client is loaded. Loads the
       * discovery doc to initialize the API.
       */
      async function initializeGapiClient() {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
      }

      /**
       * Callback after Google Identity Services are loaded.
       */
      function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // defined later
        });
        gisInited = true;
        maybeEnableButtons();
      }

      /**
       * Enables user interaction after all libraries are loaded.
       */
      function maybeEnableButtons() {
        if (gapiInited && gisInited) {
          document.getElementById('authorize_button').style.visibility = 'visible';
        }
      }

      /**
       *  Sign in the user upon button click.
       */
      function handleAuthClick() {
        tokenClient.callback = async (resp) => {
          if (resp.error !== undefined) {
            throw (resp);
          }
          document.getElementById('signout_button').style.visibility = 'visible';
          document.getElementById('authorize_button').innerText = 'Refresh';
          await listUpcomingEvents();
        };

        if (gapi.client.getToken() === null) {
          // Prompt the user to select a Google Account and ask for consent to share their data
          // when establishing a new session.
          tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
          // Skip display of account chooser and consent dialog for an existing session.
          tokenClient.requestAccessToken({prompt: ''});
        }
      }

      /**
       *  Sign out the user upon button click.
       */
      function handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token !== null) {
          google.accounts.oauth2.revoke(token.access_token);
          gapi.client.setToken('');
          document.getElementById('content').innerText = '';
          document.getElementById('authorize_button').innerText = 'Authorize';
          document.getElementById('signout_button').style.visibility = 'hidden';
        }
      }


      function addEvent() {
        // Refer to the JavaScript quickstart on how to setup the environment:
        // https://developers.google.com/calendar/quickstart/js
        // Change the scope to 'https://www.googleapis.com/auth/calendar' and delete any
        // stored credentials.
        const eventName = document.getElementById('eventName').value;
        const startTime = document.getElementById('startTime').value;
        const location = document.getElementById('location').value;
        const endTime = document.getElementById('endTime').value;
        const description = document.getElementById('description').value;
        console.log(eventName);
        console.log(description);
        console.log(startTime);
        console.log(endTime);
        const event = {
          'summary': eventName,
          'location': description,
          'description': 'A chance to hear more about Google\'s developer products.',
          'start': {
            'date': '2023-06-28T09:00:00-07:00',
            'timeZone': 'America/Los_Angeles'
          }, 
          'end': {
            'dateTime': '2023-06-28T17:00:00-08:00',
            'timeZone': 'America/Los_Angeles'
          },
          'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=1'
          ],
          'attendees': [
            {'email': 'lpage@example.com'},
            {'email': 'sbrin@example.com'}
          ],
          'reminders': {
            'useDefault': false,
            'overrides': [
              {'method': 'email', 'minutes': 24 * 60},
              {'method': 'popup', 'minutes': 10}
            ]
          }
        };

        const evenPush = gapi.client.calendar.events.insert({
          'calendarId': 'primary',
          'resource': event
        });

        evenPush.execute(function(event) {
          appendPre('Event created: ' + event.htmlLink);
        });
        handleAuthClick();
      }


      /**
       * Print the summary and start datetime/date of the next ten events in
       * the authorized user's calendar. If no events are found an
       * appropriate message is printed.
       */
      async function listUpcomingEvents() {
        let response;
        try {
          const request = {
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime',
          };
          response = await gapi.client.calendar.events.list(request);
        } catch (err) {
          document.getElementById('content').innerText = err.message;
          return;
        }

        const events = response.result.items;
        if (!events || events.length == 0) {
          document.getElementById('content').innerText = 'No events found.';
          return;
        }
        // Flatten to string to display
        const output = events.reduce(
            (str, event) => `${str}name: ${event.summary} (time= ${event.start.dateTime || event.start.date})\n`,
            'Events:\n');
        document.getElementById('content').innerText = output;
      }

      


      

  // var YOUR_CLIENT_ID = '12831201738-vobo8jvdgs1qq3hd41rgvu3see4qjl42.apps.googleusercontent.com';
  // var YOUR_REDIRECT_URI = 'http://localhost:3000/dashbroad.html';
  // var fragmentString = location.hash.substring(1);

  // // Parse query string to see if page request is coming from OAuth 2.0 server.
  // var params = {};
  // var regex = /([^&=]+)=([^&]*)/g, m;
  // while (m = regex.exec(fragmentString)) {
  //   params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  // }
  // if (Object.keys(params).length > 0) {
  //   localStorage.setItem('oauth2-test-params', JSON.stringify(params) );
  //   if (params['state'] && params['state'] == 'try_sample_request') {
  //     trySampleRequest();
  //   }
  // }

  // // If there's an access token, try an API request.
  // // Otherwise, start OAuth 2.0 flow.
  // function trySampleRequest() {
  //   console.log('1')
  //   var params = JSON.parse(localStorage.getItem('oauth2-test-params'));
  //   if (params && params['access_token']) {
  //     var xhr = new XMLHttpRequest();
  //     xhr.open('GET',
  //         'https://www.googleapis.com/drive/v3/about?fields=user&' +
  //         'access_token=' + params['access_token']);
  //     xhr.onreadystatechange = function (e) {
  //       if (xhr.readyState === 4 && xhr.status === 200) {
  //         console.log(xhr.response);
  //         window.location.href = YOUR_REDIRECT_URI;
  //       } else if (xhr.readyState === 4 && xhr.status === 401) {
  //         // Token invalid, so prompt for user permission.
  //         oauth2SignIn();
  //       }
  //     };
  //     xhr.send(null);
  //   } else {
  //     oauth2SignIn();
  //   }
  // }

  // /*
  //  * Create form to request access token from Google's OAuth 2.0 server.
  //  */
  // function oauth2SignIn() {
  //   // Google's OAuth 2.0 endpoint for requesting an access token
  //   var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

  //   // Create element to open OAuth 2.0 endpoint in new window.
  //   var form = document.createElement('form');
  //   form.setAttribute('method', 'GET'); // Send as a GET request.
  //   form.setAttribute('action', oauth2Endpoint);

  //   // Parameters to pass to OAuth 2.0 endpoint.
  //   var params = {'client_id': YOUR_CLIENT_ID,
  //                 'redirect_uri': YOUR_REDIRECT_URI,
  //                 'scope': 'https://www.googleapis.com/auth/cloud-platform',
  //                 'state': 'try_sample_request',
  //                 'include_granted_scopes': 'true',
  //                 'response_type': 'token'};

  //   // Add form parameters as hidden input values.
  //   for (var p in params) {
  //     var input = document.createElement('input');
  //     input.setAttribute('type', 'hidden');
  //     input.setAttribute('name', p);
  //     input.setAttribute('value', params[p]);
  //     form.appendChild(input);
  //   }

  //   // Add form to page and submit it to open the OAuth 2.0 endpoint.
  //   document.body.appendChild(form);
  //   form.submit();
  // }


  // function logOut() {
  //   if (confirm('ban chac chan muon thoat')=== true) {
  //     localStorage.removeItem('oauth2-test-params')
  //   window.location.href = 'http://localhost:3000';
  //   } 
  // }