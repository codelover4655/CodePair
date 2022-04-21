import React, { useState, useRef, useEffect } from 'react';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditorPage = () => {
	const reactNavigator = useNavigate();
	const location = useLocation();
	const socketRef = useRef(null);
	const { roomId } = useParams();

	const [clients, setClients] = useState([]);

	useEffect(() => {
		async function init() {
			socketRef.current = await initSocket();
			socketRef.current.on('connect_error', (err) => handleErrors(err));
			socketRef.current.on('connect_failed', (err) => handleErrors(err));

			function handleErrors(e) {
				console.log('Socket Error', e);
				toast.error('Socket Connection Failed, Try Again Later !');
				reactNavigator('/');
			}

			socketRef.current.emit(ACTIONS.JOIN, {
				roomId,
				username: location.state?.username,
			});

			// Listening for Joined Event
			socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
				if (username !== location.state?.username) {
					toast.success(`${username} joined the Room`);
				}

				setClients(clients);
			});
		}
		init();
	});

	if (!location.state) {
		return <Navigate to='/' />;
	}

	return (
		<div className='mainWrap'>
			<div className='aside'>
				<div className='asideInner'>
					<div className='logo'>
						<img className='logoImage' src='/logo.png' alt='logo' />
					</div>
					<h3>Connected</h3>
					<div className='clientsList'>
						{clients.map((client) => (
							<Client key={client.socketId} username={client.username} />
						))}
					</div>
				</div>
				<button className='btn copyBtn'>COPY ROOM ID</button>
				<button className='btn leaveBtn'>Leave</button>
			</div>
			<div className='editorWrap'>
				<Editor />
			</div>
		</div>
	);
};

export default EditorPage;
