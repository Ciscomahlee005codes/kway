import { useEffect, useState } from "react";
import { supabase } from "../../../supabase";
import "./AdminTestimonials.css";

const AdminTestimonials = () => {
  const [list, setList] = useState([]);

  const load = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select(`
        *,
        profile:profiles(id,name,photo)
      `)
      .order("created_at", { ascending: false });

    if (!error) setList(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
   <>
     <h2 className="admin-heading">User Testimonials</h2>
    <div className="admin-testimonial">

      {list.map((t) => (
        <div key={t.id} className="testimonial-card-admin">
          <div className="top">
            <img src={t.profile?.photo || "/avatar.png"} alt="" />
            <div>
              <h4>{t.profile?.name || "User"}</h4>
              <span>{new Date(t.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="stars">
            {"⭐".repeat(t.rating)}
          </div>

          <p>{t.message}</p>
        </div>
      ))}
    </div>
   </>
  );
};

export default AdminTestimonials;