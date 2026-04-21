import { useState } from "react";
import "./TestimonialModal.css";
import { supabase } from "../../supabase";
import toast from "react-hot-toast";

const TestimonialModal = ({ user, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitTestimonial = async () => {
  if (!message) {
    toast.error("Please write something 😊");
    return;
  }

  setLoading(true);

  const { error } = await supabase.from("testimonials").insert([
    {
      user_id: user.id,
      rating,
      message,
    },
  ]);

  setLoading(false);

  if (error) {
    toast.error(error.message);
    return;
  }

  toast.success("Thanks for your feedback ❤️");
  localStorage.setItem("kway_reviewed", "true");
  onSubmitted();
  onClose();
};

  return (
    <div className="testimonial-overlay">
      <div className="testimonial-card">
        <h3>Tell Us About Kway</h3>

        <div className="rating">
          {[1,2,3,4,5].map((num)=>(
            <span
              key={num}
              className={num <= rating ? "star active" : "star"}
              onClick={()=>setRating(num)}
            >
              ⭐
            </span>
          ))}
        </div>

        <textarea
          placeholder="What do you like? What should we improve?"
          value={message}
          onChange={(e)=>setMessage(e.target.value)}
        />

        <div className="testimonial-actions">
          <button onClick={onClose}>Later</button>
          <button onClick={submitTestimonial}>
            {loading ? "Sending..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialModal;