import React from 'react';
import Avatar from 'react-avatar';

const Client = ({username}) => {
    return (
        <div className="ed-client">
            <Avatar name={username} size={44} round="10px" />
            <span className="ed-client-name" title={username}>
                {username}
            </span>
        </div>
    );
};

export default Client;
