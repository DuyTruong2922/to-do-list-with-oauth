  /* exported gapiLoaded */
      /* exported gisLoaded */
      /* exported handleAuthClick */
      /* exported handleSignoutClick */

      // TODO(developer): Set to client ID and API key from the Developer Console


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
      document.getElementById('loged-content').style.visibility = 'hidden';

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
          document.getElementById('loged-content').style.visibility = 'visible';
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
        const st = new Date(document.getElementById('startTime').value);
        const startTime = st.toISOString();
        // const location = document.getElementById('location').value;
        const et = new Date(document.getElementById('endTime').value);
        const endTime = et.toISOString();
        // const description = document.getElementById('description').value;
        const event = {
          'summary': eventName,
          // 'location': location,
          // 'description': description,
          'start': {
            'dateTime': startTime,
            'timeZone': 'Asia/Ho_Chi_Minh'
          },
          'end': {
            'dateTime': endTime,
            'timeZone': 'Asia/Ho_Chi_Minh'
          },
          'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=1'
          ],
          // 'attendees': [
          //   {'email': 'lpage@example.com'},
          //   {'email': 'sbrin@example.com'}
          // ],
          'reminders': {
            'useDefault': false,
            'overrides': [
              {'method': 'email', 'minutes': 24 * 60},
              {'method': 'popup', 'minutes': 10}
            ]
          }
        };

        const evenAdd = gapi.client.calendar.events.insert({
          'calendarId': 'primary',
          'resource': event
        });

        evenAdd.execute(function(event) {
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
            // (str, event) => `${str}` +"<div style='margin-top: 1%;'> name: " +  `${event.summary}`+ "</div> <div style='border-bottom: 1px solid black;'>start:"+` ${event.start.dateTime || event.start.date}`+  " deadline: " + `${event.end.dateTime || event.end.date} </div>`,
            // 'task:\n');
            (str, event) => `${str} <div style='margin-top: 1%;'>${event.summary}</div> <div style='border-bottom: 1px solid black;'>start: ${event.start.dateTime || event.start.date} deadline: ${event.end.dateTime || event.end.date} </div>\n`,
            'Events:\n');
        document.getElementById('content').innerHTML = output;

        
      }
      function clearCalendar() {
        var listEvent = gapi.client.calendar.getEvents();
        listEvent.forEach(event => { 
          event.remove()
        });
      }

      