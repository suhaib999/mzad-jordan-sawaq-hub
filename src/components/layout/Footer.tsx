
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-mzad-dark text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Buy</h3>
            <ul className="space-y-2">
              <li><Link to="/registration" className="hover:text-mzad-accent">Registration</Link></li>
              <li><Link to="/buyer-protection" className="hover:text-mzad-accent">Buyer Protection</Link></li>
              <li><Link to="/bidding" className="hover:text-mzad-accent">Bidding & Buying Help</Link></li>
              <li><Link to="/stores" className="hover:text-mzad-accent">Stores</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Sell</h3>
            <ul className="space-y-2">
              <li><Link to="/start-selling" className="hover:text-mzad-accent">Start Selling</Link></li>
              <li><Link to="/seller-fees" className="hover:text-mzad-accent">Seller Fees</Link></li>
              <li><Link to="/seller-center" className="hover:text-mzad-accent">Seller Center</Link></li>
              <li><Link to="/seller-protection" className="hover:text-mzad-accent">Seller Protection</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">About MzadKumSooq</h3>
            <ul className="space-y-2">
              <li><Link to="/company" className="hover:text-mzad-accent">Company Info</Link></li>
              <li><Link to="/news" className="hover:text-mzad-accent">News</Link></li>
              <li><Link to="/careers" className="hover:text-mzad-accent">Careers</Link></li>
              <li><Link to="/policies" className="hover:text-mzad-accent">Policies</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Help & Contact</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="hover:text-mzad-accent">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-mzad-accent">Contact Us</Link></li>
              <li><Link to="/dispute-resolution" className="hover:text-mzad-accent">Dispute Resolution</Link></li>
              <li><Link to="/site-map" className="hover:text-mzad-accent">Site Map</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-mzad-primary">Mzad</span>
                <span className="text-2xl font-bold text-mzad-secondary">KumSooq</span>
              </Link>
            </div>
            
            <div className="flex space-x-4">
              <Link to="/terms" className="hover:text-mzad-accent">Terms</Link>
              <Link to="/privacy" className="hover:text-mzad-accent">Privacy</Link>
              <Link to="/cookies" className="hover:text-mzad-accent">Cookies</Link>
              <Link to="/accessibility" className="hover:text-mzad-accent">Accessibility</Link>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>© {new Date().getFullYear()} MzadKumSooq. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
