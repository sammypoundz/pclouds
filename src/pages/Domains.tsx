import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiGlobe,
  FiCheck,
  FiTag,
  FiStar,
  FiShoppingCart,
  FiX,
  FiShield,
  FiServer,
  FiMail,
  FiZap,
  FiArrowRight,
} from "react-icons/fi";

type DomainItem = {
  name: string;
  price: number;
  available: boolean;
  premium: boolean;
  popular: boolean;
};

const Domains = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cart, setCart] = useState<DomainItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    setLoading(true);
    setSearched(true);

    await new Promise((r) => setTimeout(r, 700));

    const tlds = [".com", ".ng", ".io", ".ai", ".africa", ".net"];

    const data = tlds.map((ext) => ({
      name: `${searchTerm}${ext}`,
      available: !["admin", "test"].includes(searchTerm.toLowerCase()),
      premium: [".io", ".ai"].includes(ext),
      price:
        ext === ".ng"
          ? 8.99
          : ext === ".africa"
          ? 15.99
          : ext === ".io"
          ? 24.99
          : ext === ".ai"
          ? 39.99
          : 12.99,
      popular: ext === ".com",
    }));

    setResults(data);
    setLoading(false);
  };

  const addToCart = (item: DomainItem) => {
    if (!cart.find((c) => c.name === item.name)) {
      setCart([...cart, item]);
    }
    setShowCart(true);
  };

  const removeFromCart = (name: string) => {
    setCart(cart.filter((c) => c.name !== name));
  };

  const total = cart.reduce((sum, i) => sum + i.price, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      {/* Background glow (matches main site) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Cart button - matches site theme */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed top-24 right-6 z-50 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
      >
        <FiShoppingCart className="w-4 h-4" />
        <span className="text-sm font-medium">Cart ({cart.length})</span>
      </button>

      {/* Cart Sidebar - dark theme with blur */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-0 right-0 w-[380px] h-full bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 p-6 z-50 flex flex-col shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-white transition p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between items-center bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                    >
                      <div>
                        <div className="font-mono text-sm text-white">{item.name}</div>
                        <div className="text-xs text-gray-400">${item.price}/yr</div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.name)}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-800 pt-4 mt-4">
                  <div className="flex justify-between mb-4 text-lg">
                    <span>Total</span>
                    <span className="font-bold text-blue-400">${total.toFixed(2)}</span>
                  </div>

                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                    Checkout <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-24 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-4">
            <FiGlobe className="w-4 h-4" />
            <span>Domain Services</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
            Build your identity online
          </h1>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
            Search domains, get free SSL, email forwarding, and launch instantly.
          </p>
        </motion.div>

        {/* Trust Features (shown before search) */}
        {!searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { icon: <FiShield />, title: "Free SSL", desc: "Secure by default" },
              { icon: <FiServer />, title: "Fast DNS", desc: "Global edge routing" },
              { icon: <FiMail />, title: "Email Forwarding", desc: "Professional branding" },
              { icon: <FiZap />, title: "Instant Setup", desc: "Live in seconds" },
            ].map((f, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-800/40 transition group"
              >
                <div className="text-blue-400 mb-3 text-xl">{f.icon}</div>
                <div className="font-medium text-white">{f.title}</div>
                <div className="text-sm text-gray-500">{f.desc}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Search Bar - Vercel style but with site colors */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSearch}
          className="mb-12"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus-within:border-blue-500/50 transition">
              <FiSearch className="text-gray-500 w-5 h-5" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for your domain (e.g., mybrand)"
                className="bg-transparent w-full outline-none text-white placeholder:text-gray-500 py-3 text-base"
                autoFocus
              />
              <button
                type="submit"
                disabled={!searchTerm}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-lg text-white font-medium transition flex items-center gap-2"
              >
                Search <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.form>

        {/* Results List */}
        <div className="space-y-3">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-800/50 rounded-xl animate-pulse" />
            ))
          ) : (
            results.map((domain, idx) => (
              <motion.div
                key={domain.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-800/40 transition group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FiGlobe className="text-blue-400 w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-mono text-base text-white group-hover:text-blue-300 transition">
                      {domain.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                      {domain.available ? (
                        <span className="text-green-400 flex items-center gap-1">
                          <FiCheck className="w-3 h-3" /> Available
                        </span>
                      ) : (
                        <span className="text-red-400">Taken</span>
                      )}
                      {domain.popular && (
                        <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <FiStar className="w-3 h-3" /> Popular
                        </span>
                      )}
                      {domain.premium && (
                        <span className="flex items-center gap-1 text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                          <FiTag className="w-3 h-3" /> Premium
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {domain.available && (
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">${domain.price}</div>
                      <div className="text-xs text-gray-500">/year</div>
                    </div>
                    <button
                      onClick={() => addToCart(domain)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-md hover:shadow-blue-500/20 flex items-center gap-2"
                    >
                      Add <FiShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Empty state when searched but no results (shouldn't happen here, but safe) */}
        {searched && !loading && results.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No domains found. Try another search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Domains;