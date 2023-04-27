import React from 'react';
import { NotificationCard } from './Cards';

const NotificationList = ({ notifications }) => {
    return (
        <div className='absolute bg-white overflow-y-scroll w-64 h-72 drop-shadow-md rounded-md'>
            <h1 className='text-xl font-bold text-center p-1'>Notifications</h1>
            { (notifications.length > 0) ? 
                <div>
                    { notifications.map((item, i) => (
                        <div key={i}>
                            <NotificationCard item={item} />
                        </div>
                    ))}
                </div> : 
                <div>
                    <p className="text-center italic">No new notifications!</p>
                </div>
            }
        </div>
    );
}

export default NotificationList;