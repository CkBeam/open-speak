import ReactDOM from 'react-dom';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { validateEmail, validateTelephone } from './utils/helpers';
import MaskedInput from 'react-text-mask';
import Modal from 'react-modal';
import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';
import Loader from './Loader.js';

document.addEventListener('DOMContentLoaded', () => {
    const divsToUpdateCallMe = document.querySelectorAll(
        '.open-speak-update-me'
    );
    divsToUpdateCallMe.forEach(function (div) {
        const data = JSON.parse(div.querySelector('pre').innerHTML);

        ReactDOM.render(<CallMe id='app' {...data} />, div);
        div.classList.remove('open-speak-update-me');
    });

    function CallMe(props) {
        // React DatePicker states =================================>
        const [showCalendar, setShowCalendar] = useState(false);
        const [callbackTime, setCallbackTime] = useState(new Date());
        const [newCallbackTime, setNewCallbackTime] = useState(null);
        // time zone states
        const [startHour, setStartHour] = useState(new Date());
        const [endHour, setEndHour] = useState(new Date());

        // Form States ===========================================>
        const [firstName, setFirstName] = useState(null);
        const [lastName, setLastName] = useState(null);
        const [telephone, setTelephone] = useState(null);
        const [email, setEmail] = useState(null);
        const [encodedEmail, setEncodedEmail] = useState(null);
        const [showSubmitButton, setShowSubmitButton] = useState(false);
        const [errorMessage, setErrorMessage] = useState('');
        const [emailErrorMessage, setEmailErrorMessage] = useState('');
        const [fieldsAreEmpty, setfieldsAreEmpty] = useState(true);
        const [emailIsValid, setEmailIsValid] = useState(false);

        // loader state
        const [loading, setLoading] = useState(false);

        // talkdesk state
        const [talkdeskPhone, setTalkdeskPhone] = useState(null);
        const [talkdeskUrl, setTalkdeskUrl] = useState('');
        // prettier-ignore
        const [talkdeskCallbackNumber, setTalkdeskCallbackNumber] = useState(null);

        // modalcontactId
        const [modalIsOpen, setIsOpen] = useState(false);
        Modal.setAppElement('body');
        const [IsScheduledCallback, setIsScheduledCallback] = useState(null);

        // zoho state & quoteId
        const [quoteId, setQuoteId] = useState(null);
        const [hasBeenFired, setHasBeenFired] = useState(false);
        const [emailFromZoho, setEmailFromZoho] = useState(null);
        const [hasDealOrContact, setHasDealOrContact] = useState(false);
        const [contactId, setContactId] = useState(null);
        const [dealId, setDealId] = useState(null);
        const [quoteIdIsValid, setQuoteIdIsValid] = useState(false);

        // Create a ref for the input element
        const inputRef = useRef(null);
        // State variable to keep track of the cursor position
        const [cursorPos, setCursorPos] = useState(0);

        const showLoading = () => (loading ? <Loader /> : '');

        // modal logic
        function openModal() {
            setIsOpen(true);
        }

        function closeModal() {
            setIsOpen(false);
            setIsScheduledCallback(null);
            window.location.reload();
        }

        function afterOpenModal() {
            // references are now sync'd and can be accessed.
        }

        // if user selects call me now
        // quoteId is not valid? => UpsertPIIToContactsImmediate();
        // Has deal or contact and a Quote Id? => PutToContactsImmediate();
        // No deal or contact and has quoteID? => UpsertToLeadsImmediate();
        const SubmitHandler = (event) => {
            event.preventDefault();
            if (quoteIdIsValid === false) {
                UpsertPIIToContactsImmediate();
                setShowCalendar(false);
                setFirstName('');
                setLastName('');
                setTelephone('');
                setEmail('');
            }
            if (hasDealOrContact && quoteIdIsValid) {
                PutToContactsImmediate();
                setShowCalendar(false);
                setFirstName('');
                setLastName('');
                setTelephone('');
                setEmail('');
            }
            if (!hasDealOrContact && quoteIdIsValid) {
                UpsertToLeadsImmediate();
                setShowCalendar(false);
                setFirstName('');
                setLastName('');
                setTelephone('');
                setEmail('');
            }
        };

        // pulls quoteId from url
        const HandleQuoteId = () => {
            const str = window.location.href;
            const converted = str.split('?')[1];
            setQuoteId(converted);
        };

        // if user selects scheduled callback
        // quoteId is not valid? => UpsertPIIToContacts();
        // has deal or contact and a Quote Id? => PutToContacts();
        // No deal or contact and has quoteID? => UpsertToLeads();
        const HandleScheduledCallback = () => {
            setIsScheduledCallback(true);
            if (quoteIdIsValid === false) {
                UpsertPIIToContacts();
                setShowCalendar(false);
            }
            if (hasDealOrContact && quoteIdIsValid) {
                PutToContacts();
                setShowCalendar(false);
            }
            if (!hasDealOrContact && quoteIdIsValid) {
                UpsertToLeads();
                setShowCalendar(false);
            }
        };

        // Calls lambda function "lets-chat-scheduled-callback" || Api Gateway: "wp-plugin-handler-api-2.0" || Route: /lets-chat-scheduled-callback
        const ScheduledCallback = async (deal_id, contact_id) => {
            let zohoUrl = `https://ttw2apr2x3.execute-api.us-east-1.amazonaws.com/dev/lets-chat-scheduled-callback?firstName=${firstName}&lastName=${lastName}&telephone=%2B1%20${telephone}&Callback_Time=${newCallbackTime}&email=${encodedEmail}&quote_id=${quoteId}&deal_id=${deal_id}&contact_id=${contact_id}&contactPhoneNumber=${talkdeskCallbackNumber}`;
            setLoading(true);
            try {
                const response = await axios({
                    method: 'POST',
                    url: zohoUrl,
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'cors',
                });
                setShowSubmitButton(false);
                setLoading(false);
                console.log(response.data);
                openModal();
            } catch (e) {
                console.log(e);
            }
        };

        // Calls lambda function "lets-chat-scheduled-callback-no-deal" || Api Gateway: "wp-plugin-handler-api-2.0" || Route: /lets-chat-scheduled-callback-no-deal
        const ScheduledCallbackNoDeal = async (contact_id) => {
            let url = `https://ttw2apr2x3.execute-api.us-east-1.amazonaws.com/dev/lets-chat-scheduled-callback-no-deal?firstName=${firstName}&lastName=${lastName}&telephone=%2B1%20${telephone}&Callback_Time=${newCallbackTime}&email=${encodedEmail}&contact_id=${contact_id}&contactPhoneNumber=${talkdeskCallbackNumber}`;
            setLoading(true);
            try {
                const response = await axios({
                    method: 'POST',
                    url: url,
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'cors',
                });
                setShowSubmitButton(false);
                setLoading(false);
                console.log(response.data);
                openModal();
            } catch (e) {
                console.log(e);
            }
        };

        // Calls lambda function "immediate-callback-no-conversion" || Api Gateway: "wp-plugin-handler-api-2.0" || Route: /immediate-callback-no-conversion
        const HandleImmediateCallbackApi = async () => {
            setLoading(true);
            setIsScheduledCallback(false);
            try {
                const response = await axios({
                    method: 'POST',
                    url: talkdeskUrl,
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'cors',
                });
                console.log(response.data);
                setLoading(false);
                openModal();
            } catch (e) {
                console.log(e);
            }
        };

        // Calls lambda function "lets-chat-no-contact" || Api Gateway: "wp-plugin-handler-api-2.0" || Route: /lets-chat-no-contact
        const UpsertToLeads = async () => {
            let leadUpsertUrl = `https://ttw2apr2x3.execute-api.us-east-1.amazonaws.com/dev/lets-chat-no-contact?firstName=${firstName}&lastName=${lastName}&telephone=%2B1%20${telephone}&Callback_Time=${newCallbackTime}&email=${encodedEmail}&quote_id=${quoteId}`;
            setLoading(true);
            try {
                const response = await axios({
                    method: 'POST',
                    url: leadUpsertUrl,
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'cors',
                });
                let res = response.data;
                if (res.body != undefined) {
                    setHasDealOrContact(true);
                    let parseRes = JSON.parse(res.body);
                    let contact_id = parseRes.contact_id;
                    let deal_id = parseRes.deal_id;
                    setDealId(deal_id);
                    setContactId(contact_id);
                    setLoading(false);

                    ScheduledCallback(deal_id, contact_id);
                } else {
                    setHasDealOrContact(false);
                    console.log('No Contact or Deal');
                    setLoading(false);
                }
                setLoading(false);
            } catch (e) {
                console.log(e);
            }
        };

        // Calls lambda function "lets-chat-no-contact" || Api Gateway: "wp-plugin-handler-api-2.0" || Route: /lets-chat-no-contact
        const UpsertToLeadsImmediate = async () => {
            let leadUpsertUrl = `https://ttw2apr2x3.execute-api.us-east-1.amazonaws.com/dev/lets-chat-no-contact?firstName=${firstName}&lastName=${lastName}&telephone=%2B1%20${telephone}&Callback_Time=${newCallbackTime}&email=${encodedEmail}&quote_id=${quoteId}`;
            setLoading(true);
            try {
                const response = await axios({
                    method: 'POST',
                    url: leadUpsertUrl,
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'cors',
                });
                let res = response.data;
                if (res.body != undefined) {
                    setHasDealOrContact(true);
                    let parseRes = JSON.parse(res.body);
                    let contact_id = parseRes.contact_id;
                    let deal_id = parseRes.deal_id;
                    setDealId(deal_id);
                    setContactId(contact_id);
                    setLoading(false);

                    HandleImmediateCallbackApi();
                } else {
                    setHasDealOrContact(false);
                    console.log('No Contact or Deal');
                    setLoading(false);
                }
                // setLoading(false);
            } catch (e) {
                console.log(e);
            }
        };

        const UpsertPIIToContacts = async () => {
            const contactUpsertUrl = `https://ttw2apr2x3.execute-api.us-east-1.amazonaws.com/dev/lets-chat-contact-upsert?firstName=${firstName}&lastName=${lastName}&telephone=%2B1%20${telephone}&email=${encodedEmail}`;
            setLoading(true);
            try {
                const response = await axios({
                    method: 'POST',
                    url: contactUpsertUrl,
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'cors',
                });
                let res = response.data;
                if (res.body != undefined) {
                    setHasDealOrContact(true);
                    let parseRes = JSON.parse(res.body);
                    let contact_id = parseRes.contact_id;
                    setContactId(contact_id);
                    setLoading(false);
                    ScheduledCallbackNoDeal(contact_id);
                } else {
                    setHasDealOrContact(false);
                    console.log('No Contact or Deal');
                    setLoading(false);
                }
            } catch (e) {
                console.log(e);
            }
        };

        const UpsertPIIToContactsImmediate = async () => {
            const contactUpsertUrl = `https://ttw2apr2x3.execute-api.us-east-1.amazonaws.com/dev/lets-chat-contact-upsert?firstName=${firstName}&lastName=${lastName}&telephone=%2B1%20${telephone}&email=${encodedEmail}`;
            setLoading(true);
            try {
                const response = await axios({
                    method: 'POST',
                    url: contactUpsertUrl,
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'cors',
                });
                let res = response.data;
                if (res.body != undefined) {
                    setHasDealOrContact(true);
                    let parseRes = JSON.parse(res.body);
                    let contact_id = parseRes.contact_id;
                    setContactId(contact_id);
                    setLoading(false);
                    HandleImmediateCallbackApi();
                } else {
                    setHasDealOrContact(false);
                    console.log('No Contact or Deal');
                    setLoading(false);
                }
            } catch (e) {
                console.log(e);
            }
        };

        const HandleNewTime = (date) => {
            setCallbackTime(date);
            // encodes and returns formatted time and sets the timezone to +00:00
            setNewCallbackTime(
                encodeURIComponent(
                    date.toISOString().slice(0, -5).concat(`+00:00`)
                )
            );
        };

        // ensures user cannot choose time in the past
        const FilterPassedTime = (time) => {
            const currentDate = new Date();
            // creates a 15 minute lag between when a user can schedule an appointment,
            // allows agent at least 15 minutes to prepare before scheduled appointment.
            currentDate.setMinutes(currentDate.getMinutes() + 15);
            const selectedDate = new Date(time);

            return currentDate.getTime() < selectedDate.getTime();
        };

        // validate email
        const EmailValidatorHandler = (e) => {
            e.preventDefault();
            setEmail(e.target.value);
            if (e.target.name === 'email') {
                const isValid = validateEmail(e.target.value);
                if (!isValid) {
                    setEmailErrorMessage('Your email is invalid');
                    setEmailIsValid(false);
                } else {
                    setEmailIsValid(true);
                    setEmailErrorMessage('');
                }
            }
        };

        // encode email for api endpoint
        const EncodeEmail = () => {
            let newEmail = encodeURIComponent(email);
            setEncodedEmail(newEmail);
        };

        // validate phone number
        const PhoneHandler = (e) => {
            e.preventDefault();
            setTelephone(e.target.value);
            if (e.target.name === 'telephone') {
                const isValid = validateTelephone(e.target.value);
                if (!isValid) {
                    setErrorMessage('Your phone number is invalid');
                } else {
                    setErrorMessage('');
                }
            }
        };

        // validate firstName
        const FirstNameHandler = (e) => {
            e.preventDefault();
            setFirstName(e.target.value);
            if (!e.target.value.length) {
                setErrorMessage(`First Name is required.`);
            } else {
                setErrorMessage('');
            }
        };

        // validate lastName
        const LastNameHandler = (e) => {
            e.preventDefault();
            setLastName(e.target.value);
            if (!e.target.value.length) {
                setErrorMessage(`Last Name is required.`);
            } else {
                setErrorMessage('');
            }
        };

        // captures email address
        const HandleEmail = (e) => {
            setEmail(e.target.value);
            EmailValidatorHandler(e);
        };

        // Adjusts available times based on users time zone compared to eastern time zone where agents are located.
        const HandleTimeZone = () => {
            let event = new Date();
            let startHour = event.getHours(event.setUTCHours(13));
            setStartHour(startHour);
            let endHour = event.getHours(event.setUTCHours(21));
            setEndHour(endHour);
        };

        // formats the users phone number after it is entered to the format that talkdesk api requires
        const HandleTalkdeskPhone = () => {
            let newTalkdeskPhone = `${telephone}`;
            let talkdeskFormat = newTalkdeskPhone.replace(/[\(\)\-\s']+/g, '');
            setTalkdeskPhone(talkdeskFormat);
        };

        // shows the scheduled callback calendar
        const ShowCalendarHandler = (e) => {
            e.preventDefault();
            setShowCalendar(true);
        };

        // Calls lambda function "lets-chat" || Api Gateway: "wp-plugin-handler-api-2.0" || Route: /lets-chat
        const PutToContacts = async () => {
            const contactPutUrl = `https://ttw2apr2x3.execute-api.us-east-1.amazonaws.com/dev/lets-chat?firstName=${firstName}&lastName=${lastName}&telephone=%2B1%20${telephone}&Callback_Time=${newCallbackTime}&email=${encodedEmail}&contact_id=${contactId}`;
            setLoading(true);
            try {
                const response = await axios({
                    method: 'POST',
                    url: contactPutUrl,
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'cors',
                });
                console.log(response.data);
                setLoading(false);
                ScheduledCallback(dealId, contactId);
            } catch (e) {
                console.log(e);
            }
        };

        // Calls lambda function "lets-chat" || Api Gateway: "wp-plugin-handler-api-2.0" || Route: /lets-chat
        const PutToContactsImmediate = async () => {
            const contactPutUrl = `https://ttw2apr2x3.execute-api.us-east-1.amazonaws.com/dev/lets-chat?firstName=${firstName}&lastName=${lastName}&telephone=%2B1%20${telephone}&Callback_Time=${newCallbackTime}&email=${encodedEmail}&contact_id=${contactId}`;
            setLoading(true);
            try {
                const response = await axios({
                    method: 'POST',
                    url: contactPutUrl,
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'cors',
                });
                console.log(response.data);
                setLoading(false);
                HandleImmediateCallbackApi();
            } catch (e) {
                console.log(e);
            }
        };

        // Calls lambda function "lets-chat-quote-id" || Api Gateway: "wp-plugin-handler-api-2.0" || Route: /lets-chat-quote-id
        const GetEmailFromZoho = async () => {
            setHasBeenFired(true);
            const checkIdUrl = `https://ttw2apr2x3.execute-api.us-east-1.amazonaws.com/dev/lets-chat-quote-id?quote_id=${quoteId}`;
            setLoading(true);
            try {
                const response = await axios({
                    method: 'POST',
                    url: checkIdUrl,
                    headers: { 'Content-Type': 'application/json' },
                    mode: 'cors',
                });
                let res = response.data;
                if (res.body != undefined) {
                    setHasDealOrContact(true);
                    let parseRes = JSON.parse(res.body);
                    let contact_email = parseRes.contact_email;
                    let contact_id = parseRes.contact_id;
                    let deal_id = parseRes.deal_id;
                    setEmailFromZoho(contact_email);
                    setContactId(contact_id);
                    setDealId(deal_id);
                    setLoading(false);
                    setEmailIsValid(true);
                } else {
                    setHasDealOrContact(false);
                    console.log('No Contact or Deal');
                    setLoading(false);
                }
            } catch (e) {
                console.log(e);
            }
        };

        // telephone number fix
        // Handle click event on the input element
        const handleClick = () => {
            // set the cursor position to the current cursor position
            inputRef.current.inputElement.setSelectionRange(
                cursorPos,
                cursorPos
            );
        };

        // Handle blur event on the input element
        const handleBlur = () => {
            // Update the cursorPos state with the current value length
            setCursorPos(inputRef.current.inputElement.value.length);
        };

        // end

        // OpenHouse / Frontline holidays for the next 5 years. Blackout days for scheduler.
        const holidays = [
            new Date(2022, 11, 25), // Christmas 12/25/2022
            new Date(2022, 11, 26), // Christmas 12/26/2022
            // 2023
            new Date(2023, 4, 29), // Memorial Day 5/29/2023
            new Date(2023, 6, 4), // Independence Day 7/4/2023
            new Date(2023, 8, 4), // Labor Day 9/4/2023
            new Date(2023, 10, 23), // Thanksgiving 11/23/2023
            new Date(2023, 10, 24), // Black Friday 11/24/2023
            new Date(2023, 11, 25), // Christmas Day 12/25/2023
            // 2024
            new Date(2024, 0, 1), // New Years 1/1/2024
            new Date(2024, 4, 27), // Memorial Day 5/27/2024
            new Date(2024, 6, 4), // Independence Day 7/4/2024
            new Date(2024, 8, 2), // Labor Day 9/2/2024
            new Date(2024, 10, 28), // Thanksgiving Day 11/28/2024
            new Date(2024, 10, 29), // Black Friday 11/29/2024
            new Date(2024, 11, 24), // Christmas Eve 12/24/2024
            new Date(2024, 11, 25), // Christmas day 12/25/2024
            // 2025
            new Date(2025, 0, 1), // New Years 1/1/2025
            new Date(2025, 4, 26), // Memorial Day 5/26/2025
            new Date(2025, 6, 4), // Independence Day 7/4/2025
            new Date(2025, 8, 1), // Labor Day 9/1/2025
            new Date(2025, 10, 27), // Thanksgiving Day 11/27/2025
            new Date(2025, 10, 28), // Black Friday 11/28/2025
            new Date(2025, 11, 24), // Christmas Eve 12/24/2025
            new Date(2025, 11, 25), // Christmas Day 12/25/2025
            // 2026
            new Date(2026, 0, 1), // New Years 1/1/2026
            new Date(2026, 4, 25), // Memorial Day 5/25/2026
            new Date(2026, 6, 4), // Independence Day 7/4/2026
            new Date(2026, 8, 7), // Labor Day 9/7/2026
            new Date(2026, 10, 26), // Thanksgiving Day 11/26/2026
            new Date(2026, 10, 27), // Black Friday 11/27/2026
            new Date(2026, 11, 24), // Christmas Eve 12/24/2025
            new Date(2026, 11, 25), // Christmas Day 12/25/2025
            // 2027
            new Date(2027, 0, 1), // New Years 1/1/2027
            new Date(2027, 4, 31), // Memorial Day 5/31/2027
            new Date(2027, 6, 4), // Independence Day 7/4/2027
            new Date(2027, 8, 6), // Labor Day 9/6/2027
            new Date(2027, 10, 25), // Thanksgiving Day 11/25/2027
            new Date(2027, 10, 26), // Black Friday 11/26/2027
            new Date(2027, 11, 24), // Christmas Eve 12/24/2027
            new Date(2027, 11, 25), // Christmas Day 12/25/2027
        ];

        // basic validation for quote id. Will not call api if quote id is less than 5 characters long or all 0's.
        const TestQuoteId = () => {
            // regex to check if all 0's
            let pattern = /^0*$/g;
            let quoteIdRegex = pattern.test(quoteId);

            // if quote is not null or undefined
            if (quoteId != null || quoteId != undefined) {
                // if quote id is at least 5 characters and not all 0's, call api
                if (quoteId.length > 5 && quoteIdRegex != true) {
                    setQuoteIdIsValid(true);
                    GetEmailFromZoho();
                }

                // checks if quote id is all 0's
                if (quoteIdRegex && quoteId.length != 0) {
                    setQuoteIdIsValid(false);
                }
                // checks if the quote id is non existent
                if (quoteId.length === 0) {
                    setQuoteIdIsValid(false);
                }
            }
        };

        useEffect(() => {
            // makes sure the user has selected a time, otherwise they cannot submit callback.
            if (newCallbackTime != null) {
                setShowSubmitButton(true);
            }
            // if email is not null, encode for api call
            if (email != null) {
                EncodeEmail();
            }
            // validation to make sure the user cannot submit form if any fields are blank
            if (firstName && lastName && telephone && email !== null) {
                setfieldsAreEmpty(false);
            } else {
                setfieldsAreEmpty(true);
            }
            // calls function to format phone number for talkdesk api
            HandleTalkdeskPhone();
            // calls function to account for time zone
            HandleTimeZone();
            // calls function for validating the Quote Id
            HandleQuoteId();
            // final validation for talkdesk phone number before api call
            if (talkdeskPhone != null) {
                let talkdeskCallbackNumberCache = `%2B1${talkdeskPhone}`;
                setTalkdeskCallbackNumber(talkdeskCallbackNumberCache);
            }
            // talkdesk api url
            if (talkdeskCallbackNumber != null) {
                let talkdeskUrlCache = `https://ttw2apr2x3.execute-api.us-east-1.amazonaws.com/dev/immediate-callback-no-conversion?firstName=${firstName}&lastName=${lastName}&contactPhoneNumber=${talkdeskCallbackNumber}`;
                setTalkdeskUrl(talkdeskUrlCache);
            }

            // makes sure that the api call for doing query on quote id only gets fired once.
            if (!hasBeenFired) {
                TestQuoteId();
            }
            // if zoho has an email on file from quote id, then set the email in the input field.
            if (emailFromZoho != null) {
                setEmail(emailFromZoho);
            }
        });

        return (
            <>
                {showLoading()}
                {IsScheduledCallback ? (
                    <Modal
                        isOpen={modalIsOpen}
                        onAfterOpen={afterOpenModal}
                        onRequestClose={closeModal}
                        contentLabel='Scheduled Callback Modal'
                        className='Modal'
                        overlayClassName='Overlay'
                    >
                        <div className='modal-cont'>
                            <p>Your call has been scheduled. Thank you!</p>
                            <button
                                className='close-modal'
                                onClick={() => closeModal()}
                            >
                                Close
                            </button>
                        </div>
                    </Modal>
                ) : (
                    <Modal
                        isOpen={modalIsOpen}
                        onAfterOpen={afterOpenModal}
                        onRequestClose={closeModal}
                        contentLabel='Immediate Callback Modal'
                        className='Modal'
                        overlayClassName='Overlay'
                    >
                        <div className='modal-cont'>
                            <p>
                                Thanks! You will receive a call as soon as an
                                agent is available.
                            </p>
                            <button
                                className='close-modal'
                                onClick={() => closeModal()}
                            >
                                Close
                            </button>
                        </div>
                    </Modal>
                )}
                <form className='call-me-form' autoComplete='false'>
                    <div className='label-cont'>
                        <label htmlFor='fname'>First name</label>
                        <div className='req-cont'>
                            <span class='required'>*(required)</span>
                        </div>
                    </div>
                    <input
                        type='text'
                        name='f-name'
                        onBlur={FirstNameHandler}
                        onChange={(e) => setFirstName(e.target.value)}
                        defaultValue={firstName}
                    />
                    <div className='label-cont'>
                        <label htmlFor='lname'>Last name</label>
                        <div className='req-cont'>
                            <span class='required'>*(required)</span>
                        </div>
                    </div>
                    <input
                        type='text'
                        name='l-name'
                        onChange={(e) => setLastName(e.target.value)}
                        onBlur={LastNameHandler}
                        defaultValue={lastName}
                    />
                    <div className='label-cont'>
                        <label htmlFor='telephone'>Telephone</label>
                        <div className='req-cont'>
                            <span class='required'>*(required)</span>
                        </div>
                    </div>
                    <MaskedInput
                        type='tel'
                        name='telephone'
                        // prettier-ignore
                        mask={['(',/[1-9]/,/\d/,/\d/,')',' ',/\d/,/\d/,/\d/,'-',/\d/,/\d/,/\d/,/\d/,]}
                        guide={false}
                        showMask={false}
                        ref={inputRef}
                        onClick={handleClick}
                        onChange={(e) => {
                            setTelephone(e.target.value);
                            PhoneHandler(e);
                            setCursorPos(e.target.value.length);
                        }}
                        onBlur={(e) => {
                            PhoneHandler(e);
                            handleBlur();
                        }}
                    />

                    <div className='label-cont'>
                        <label htmlFor='email'>Email</label>
                        <div className='req-cont'>
                            <span class='required'>*(required)</span>
                        </div>
                    </div>
                    <input
                        type='email'
                        name='email'
                        onChange={(e) => HandleEmail(e)}
                        defaultValue={email}
                    />
                    {errorMessage && (
                        <div className='error-div'>
                            <p className='error-text'>{errorMessage}</p>
                        </div>
                    )}
                    {emailErrorMessage && (
                        <div className='error-div'>
                            <p className='error-text'>{emailErrorMessage}</p>
                        </div>
                    )}

                    <button
                        type='submit'
                        className='call-me-button'
                        onClick={SubmitHandler}
                        disabled={
                            errorMessage || fieldsAreEmpty || !emailIsValid
                                ? true
                                : false
                        }
                    >
                        Call Me Now
                    </button>
                    <br />
                    <button
                        onClick={(e) => ShowCalendarHandler(e)}
                        id='click-here'
                        disabled={
                            errorMessage || fieldsAreEmpty || !emailIsValid
                                ? true
                                : false
                        }
                    >
                        Schedule a Callback
                    </button>

                    {showCalendar && (
                        <>
                            <span class='calendar-copy'>
                                Pick a Date &amp; Time
                            </span>
                            <div id='calendar'>
                                <div>
                                    <DatePicker
                                        selected={callbackTime}
                                        onChange={(date) => HandleNewTime(date)}
                                        showTimeSelect
                                        dateFormat='MMMM d, yyyy h:mm aa'
                                        filterDate={(date) =>
                                            date.getDay() != 6 &&
                                            date.getDay() != 0
                                        }
                                        filterTime={FilterPassedTime}
                                        excludeDates={holidays}
                                        minTime={setHours(
                                            setMinutes(new Date(), 30),
                                            startHour
                                        )}
                                        maxTime={setHours(
                                            setMinutes(new Date(), 30),
                                            endHour
                                        )}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </form>
                {showSubmitButton && (
                    <div className='schedule-button-cont'>
                        <button
                            onClick={(e) => HandleScheduledCallback()}
                            className='schedule-btn'
                            disabled={
                                errorMessage || fieldsAreEmpty || !emailIsValid
                                    ? true
                                    : false
                            }
                        >
                            Schedule
                        </button>
                    </div>
                )}
            </>
        );
    }
});
