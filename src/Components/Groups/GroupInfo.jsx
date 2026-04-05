import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useParams, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import AddMemberModal from "./AddMemberModal";
import "./GroupInfo.css";

const GroupInfo = () => {

const { id } = useParams();
const navigate = useNavigate();

const [group,setGroup]=useState(null);
const [members,setMembers]=useState([]);
const [currentUser,setCurrentUser]=useState(null);
const [isAdmin,setIsAdmin]=useState(false);
const [selectedMember, setSelectedMember] = useState(null);
const [showAddMember, setShowAddMember] = useState(false);

useEffect(()=>{
fetchCurrentUser();
fetchGroup();
},[]);

useEffect(()=>{
if(currentUser){
fetchMembers();
}
},[currentUser]);


const fetchCurrentUser = async () => {

const { data } = await supabase.auth.getUser();

setCurrentUser(data.user.id);

};


useEffect(()=>{

document.body.classList.add("chat-open");

return()=>{

document.body.classList.remove("chat-open");

};

},[]);


const fetchGroup = async()=>{

const {data}=await supabase
.from("groups")
.select("*")
.eq("id",id)
.single();

setGroup(data);

};


const fetchMembers = async()=>{

const {data,error}=await supabase
.from("group_members")
.select(`
role,
user_id,
profiles:user_id(
id,
name,
photo
)
`)
.eq("group_id",id);

if(error){

console.log(error.message);
return;

}

const uniqueMembers=Array.from(
new Map(data.map(m=>[m.user_id,m])).values()
);

setMembers(uniqueMembers);

checkAdmin(uniqueMembers, currentUser);

};
const checkAdmin = (list, userId) => {

if(!userId) return;

const me = list.find(m => m.user_id === userId);

setIsAdmin(me?.role === "admin");

};
//////////////////////////////////////////////////////////
// ADMIN ACTIONS
//////////////////////////////////////////////////////////


const promoteToAdmin = async(userId)=>{

await supabase
.from("group_members")
.update({role:"admin"})
.eq("group_id",id)
.eq("user_id",userId);

fetchMembers();

};


const removeMember = async(userId)=>{

await supabase
.from("group_members")
.delete()
.eq("group_id",id)
.eq("user_id",userId);

fetchMembers();

};


const changeGroupName = async()=>{

const name = prompt("Enter new group name");

if(!name) return;

await supabase
.from("groups")
.update({name})
.eq("id",id);

fetchGroup();

};


const changeGroupPhoto = async(e)=>{

const file=e.target.files[0];

if(!file) return;

const filePath=`group-images/${Date.now()}-${file.name}`;

await supabase.storage
.from("avatars")
.upload(filePath,file);

const {data}=supabase.storage
.from("avatars")
.getPublicUrl(filePath);

await supabase
.from("groups")
.update({image:data.publicUrl})
.eq("id",id);

fetchGroup();

};


//////////////////////////////////////////////////////////
// UI
//////////////////////////////////////////////////////////


return(

<div className="group-info-page">


{/* HEADER */}

<div className="group-info-header-modern">

<IoArrowBack
onClick={()=>navigate(`/group/${id}`)}
/>

<h3>Group Info</h3>

</div>


{/* HERO */}

<div className="group-hero">

<label className="group-avatar-large" style={{cursor:isAdmin ? "pointer":"default"}}>

{group?.image ? (

<img src={group.image}/>

):( 

<span>
{group?.name?.charAt(0)}
</span>

)}

{isAdmin && (

<input
type="file"
hidden
onChange={changeGroupPhoto}
/>

)}

</label>


<h2>

{group?.name}

{isAdmin && (

<span
className="edit-name"
onClick={changeGroupName}
>

✏️

</span>

)}

</h2>


<div className="member-count-chip">

{members.length} Members

</div>

</div>



{/* ADMIN ACTIONS */}

{isAdmin && (

<div className="group-actions">

<button
className="action-btn"
 onClick={() => setShowAddMember(true)}>

Add Member

</button>

</div>

)}



{/* MEMBERS */}

<div className="members-card">

<div className="members-header">

Participants

<span>

{members.length}

</span>

</div>


{members.map(member=>(

<div
  key={member.user_id}
  className="member-row"
  onClick={() => setSelectedMember(member)}
>

{member.profiles?.photo ?

<img src={member.profiles.photo}/>

:

<div className="avatar-fallback">

{member.profiles?.name?.charAt(0)}

</div>

}


<div className="member-meta">

<p>

{member.profiles?.name}

</p>


{member.role==="admin" && (

<span className="admin-badge">

Admin

</span>

)}


</div>


{isAdmin && member.user_id!==currentUser && (

<div className="admin-controls">
<button
className="danger"
onClick={(e)=>{
e.stopPropagation();
removeMember(member.user_id);
}}
>

Remove

</button>

</div>

)}

</div>
))}
</div>
{showAddMember && (
  <AddMemberModal
    groupId={id}
    existingMembers={members.map(m => m.user_id)}
    onClose={() => setShowAddMember(false)}
    onAdded={fetchMembers}
  />
)}
{/* MEMBER PROFILE MODAL */}
{selectedMember && (
  <div
    className="profile-modal-overlay"
    onClick={() => setSelectedMember(null)}
  >
    <div
      className="profile-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="close-btn"
        onClick={() => setSelectedMember(null)}
      >
        ✖
      </button>

      <div className="profile-modal-header">
        <div className="profile-avatar-large">
          {selectedMember.profiles?.photo ? (
            <img src={selectedMember.profiles.photo} alt="avatar" />
          ) : (
            selectedMember.profiles?.name?.charAt(0)
          )}
        </div>
        <h3>{selectedMember.profiles?.name}</h3>
      </div>

      <div className="profile-actions">
        <button
          className="action-btn2"
          onClick={() =>
            navigate(`/user-profile/${selectedMember.user_id}`)
          }
        >
          👁 View Profile
        </button>

        <button
          className="action-btn2"
          onClick={() =>
            navigate(`/chat/${selectedMember.user_id}`)
          }
        >
          💬 Chat
        </button>
      </div>
    </div>
  </div>
)}
</div>
);

};

export default GroupInfo;