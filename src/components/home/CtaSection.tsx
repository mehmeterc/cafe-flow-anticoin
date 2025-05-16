
import { Link } from "react-router-dom";

const CtaSection = () => {
  return (
    <div className="py-20 px-4 sm:px-6 text-center">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold mb-6">Ready to boost your productivity?</h2>
        <p className="text-lg text-gray-600 mb-10">
          Join thousands of professionals who are already transforming their focus into rewards
        </p>
        
        <Link 
          to="/explore" 
          className="inline-flex items-center gradient-button text-lg px-8 py-4"
        >
          Get Started for Free
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default CtaSection;
