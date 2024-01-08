import React from 'react';

import { UserProps } from '@/types';

interface UserCardProps {
  user: UserProps;
  admin: UserProps;
}

const Member = ({ user, admin }: UserCardProps) => {
  return (
    <div className="border-2 border-neutral-400 rounded-xl h-10 w-full bg-neutral-100 p-4 flex items-center justify-center ">
      <div className="text-lg font-Roboto">{user.name}</div>
      {user.id === admin.id && (
        <div className="text-lg font-Roboto text-neutral-400 ml-2">(Admin)</div>
      )}
    </div>
  );
};
const UserCard = ({ user, admin }: UserCardProps) => {
  return <Member admin={admin} user={user}></Member>;
};

export default UserCard;
