import React, { useState, useEffect } from 'react';
import axios from "axios";
import Receipt from './Receipt';
import Spinner from 'react-bootstrap/Spinner';

function Dashboard() {
    const [listOfRecipients, setListOfRecipients] = useState([]);
    const [initialLoad, setInitialLoad] = useState(true);
    const [selectedRecipient, setSelectedRecipient] = useState('');
    const [inputAmount, setInputAmount] = useState(null);
    const [receipt, setReceiptDetails] = useState({ donationId: null, donor: null, recipient: null, amount: null, donationDate: null });
    const [showReceipt, setShowReceipt] = useState(false);
    const [display, setDisplay] = useState({ display: 'none' }); // validation div alerts
    // const [blockNumber, setBlockNumber] = useState(true);
    const [sequenceNumber, setSequenceNumber] = useState(1); // Starting sequence number
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedRecipients, setSuggestedRecipients] = useState([]);
    const [inputText, setInputText] = useState('');

    // handle change on input text
    const handleInputChange = (event) => {
        const value = event.target.value;
        setInputText(value);

        // Filter recipients based on input text
        const filteredRecipients = listOfRecipients.filter(recipient =>
            recipient.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestedRecipients(filteredRecipients);
    };

    // handle selection from suggestions
    const handleSelectRecipient = (recipient) => {
        setSelectedRecipient(recipient);
        setInputText(recipient);
        setSuggestedRecipients([]);
    };

    // fetch from backend the list of recipients
    useEffect(() => {
        // Check if it's not the initial load
        if (!initialLoad) {
            axios.get("http://localhost:3001/registration/recipients")
                .then((response) => {
                    console.log('setListOfRecipients: ', response.data.list);
                    setListOfRecipients(response.data.list.map(item => item.ngo_name));
                })
                .catch((error) => {
                    console.error("Error on catching: ", error);
                });
        } else {
            // Set initialLoad to false after the first load
            setInitialLoad(false);
        }
    }, [initialLoad]);

    // Define the URL
    const getUrl = 'http://localhost:3000/api/query-donation/';
    const postUrl = 'http://localhost:3000/api/send-donation';

    // Define the headers
    const headers = {
        'identitylabel': 'User1@org1.example.com'
    };

    const generateNextDonationId = () => {
        const nextSequenceNumber = sequenceNumber + 1;
        setSequenceNumber(`don-${nextSequenceNumber}`);
        return sequenceNumber;
    };

    const handleSubmit = (event) => {
        event.preventDefault(); //prevent form submission

        // Check Input Fields Validations to show receipt
        if (inputAmount !== null && selectedRecipient !== '') {
            setIsLoading(true); // Start loading

            // Request body
            const requestBody = {
                functionName: "createDonation",
                args: [generateNextDonationId(), "BWT", selectedRecipient, inputAmount.toString()]
            };

            // POST request Donation
            axios.post(postUrl, requestBody, { headers })
                .then((postResponse) => {
                    console.log('donation response: ', postResponse.data);

                    // GET request after successful POST
                    const blockNumberFromPost = postResponse.data.blockNumber;
                    console.log('get url: ', getUrl + sequenceNumber);
                    return axios.get(getUrl + sequenceNumber, { headers })
                        .then((getResponse) => {
                            console.log('get donation details: ', getResponse.data);
                            // Upon successful response, set the receipt details
                            setReceiptDetails({
                                block: blockNumberFromPost,
                                recipient: selectedRecipient,
                                amount: getResponse.data.transaction.amount,
                                donationTimestamp: formatTimestamp(getResponse.data.transaction.dateUTC)
                            });

                            setIsLoading(false); // Stop loading
                            setShowReceipt(true); // Show the receipt
                        });
                })
                .catch((error) => {
                    console.error("Error on catching: ", error);
                    setIsLoading(false); // Stop loading on error
                });
        } else {
            setDisplay({ display: 'block' });
        }
    };

    const handleOnChangeAmount = event => {
        let amount = event.currentTarget.value;

        // Amount cannot be in decimal - not accepted in eth
        const decimalIndex = amount.indexOf('.');
        if (decimalIndex !== -1) {
            amount = amount.slice(0, 0);
        }

        // ensures consistency in the state when the user clears the input field after entering some value
        setInputAmount(amount === '' ? null : amount);
    };

    // reset all input
    const handleCancel = () => {
        setSelectedRecipient('');
        setInputText('');
        setInputAmount(null);
        setShowReceipt(false);
        // Hide validation messages
        setDisplay({ display: 'none' });
    };

    // Function to convert timestamp with current locale
    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        });
    };

    return (
        <div className="container">
            <div className="row mt-3">
                <div className="col-md-12 mb-3">
                    <div className="card border-info">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className='row text-center justify-content-center'>
                                    <h5>Recipient</h5>
                                    <div className='col-md-8'>
                                        <input className='form-control'
                                               type='text'
                                               placeholder='Type to search recipients'
                                               onChange={handleInputChange}
                                               value={inputText}
                                        />
                                        {/* Render suggestions based on input */}
                                        {suggestedRecipients.length > 0 && (
                                            <ul className="list-group mt-2">
                                                {suggestedRecipients.map((recipient, index) => (
                                                    <li key={index} className="list-group-item"
                                                        onClick={() => handleSelectRecipient(recipient)}>
                                                        {recipient}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {/* Conditional Rendering of Required Fields */}
                                        {selectedRecipient === '' && !showReceipt && (
                                            <div className="alert alert-danger mt-1" role="alert" id="validations" style={display}>
                                                Recipient is required.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className='row text-center justify-content-center mt-3'>
                                    <h5>Amount</h5>
                                    <div className='col-md-8'>
                                        <input className='form-control'
                                               type='number'
                                               placeholder='Liters'
                                               onChange={handleOnChangeAmount}
                                               value={inputAmount || ''}
                                               style={{ borderRadius: '0.25rem' }}
                                        />
                                        {/* Conditional Rendering of Required Fields */}
                                        {inputAmount === null && !showReceipt && (
                                            <div className="alert alert-danger mt-1" role="alert" id="validations" style={display}>
                                                Input Amount is required.
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className='row text-center justify-content-center mt-3'>
                                    <button type='submit' className='btn btn-outline-primary col-md-5' disabled={showReceipt}>Submit</button>
                                </div>
                                <div className='row text-center justify-content-center mt-3'>
                                    <button type='button' className='btn btn-outline-secondary col-md-5' onClick={handleCancel}>Reset</button>
                                </div>
                            </form>
                        </div>

                        <div className='card-body'>
                            {isLoading && (
                                <div className="text-center">
                                    <Spinner animation="border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </Spinner>
                                </div>
                            )}
                            {/* Use conditional rendering to show the receipt details */}
                            {receipt && showReceipt && !isLoading &&
                            <div className='row alert alert-info'>
                                <Receipt receiptDetails={receipt} />
                            </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;
