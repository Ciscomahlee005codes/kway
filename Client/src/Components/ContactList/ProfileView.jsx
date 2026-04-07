import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

const ProfileView = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setProfile(data);
    };

    fetchProfile();
  }, [id]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <img src={profile.photo} width="120" />
      <h2>{profile.name}</h2>
      <p>@{profile.username}</p>
      <p>{profile.about}</p>
    </div>
  );
};

export default ProfileView;
