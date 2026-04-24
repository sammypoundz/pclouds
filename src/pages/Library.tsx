import React from 'react';
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiCopy,
  FiCheck,
  FiGithub,
  FiBookOpen,
  FiDownload,
  FiCpu,
  FiArrowRight,
} from "react-icons/fi";
import { SiJavascript, SiPython, SiPhp, SiGo, SiRubyonrails, SiDotnet, SiDart } from "react-icons/si";
import { FaJava } from "react-icons/fa";

type LibraryItem = {
  id: string;
  name: string;
  language: string;
  description: string;
  version: string;
  installCommand: string;
  githubUrl: string;
  docsUrl: string;
  category: "official" | "community";
  icon: React.ReactNode;   // ✅ Changed from JSX.Element
};

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "official" | "community">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const libraries: LibraryItem[] = [
    {
      id: "js",
      name: "PCLOUDs JavaScript SDK",
      language: "JavaScript / TypeScript",
      description: "Official SDK for Node.js and browser. Full API support, type definitions, and promise-based.",
      version: "v2.1.0",
      installCommand: "npm install @pclouds/sdk",
      githubUrl: "https://github.com/pclouds/js-sdk",
      docsUrl: "https://docs.pclouds.africa/sdk/javascript",
      category: "official",
      icon: <SiJavascript className="text-yellow-400" />,
    },
    {
      id: "python",
      name: "PCLOUDs Python SDK",
      language: "Python",
      description: "Async and sync client for Python 3.8+. Full typing support and comprehensive examples.",
      version: "v2.0.1",
      installCommand: "pip install pclouds-sdk",
      githubUrl: "https://github.com/pclouds/python-sdk",
      docsUrl: "https://docs.pclouds.africa/sdk/python",
      category: "official",
      icon: <SiPython className="text-blue-400" />,
    },
    {
      id: "php",
      name: "PCLOUDs PHP SDK",
      language: "PHP",
      description: "Composer package for PHP 7.4+. Includes Guzzle HTTP client and Laravel integration.",
      version: "v1.5.0",
      installCommand: "composer require pclouds/sdk",
      githubUrl: "https://github.com/pclouds/php-sdk",
      docsUrl: "https://docs.pclouds.africa/sdk/php",
      category: "official",
      icon: <SiPhp className="text-indigo-400" />,
    },
    {
      id: "go",
      name: "PCLOUDs Go SDK",
      language: "Go",
      description: "Native Go module with context support, retries, and automatic request signing.",
      version: "v1.3.0",
      installCommand: "go get github.com/pclouds/go-sdk",
      githubUrl: "https://github.com/pclouds/go-sdk",
      docsUrl: "https://docs.pclouds.africa/sdk/go",
      category: "official",
      icon: <SiGo className="text-cyan-400" />,
    },
    {
      id: "ruby",
      name: "PCLOUDs Ruby SDK",
      language: "Ruby",
      description: "Ruby gem with ActiveSupport integration. REST client with built-in error handling.",
      version: "v1.2.0",
      installCommand: "gem install pclouds-sdk",
      githubUrl: "https://github.com/pclouds/ruby-sdk",
      docsUrl: "https://docs.pclouds.africa/sdk/ruby",
      category: "community",
      icon: <SiRubyonrails className="text-red-400" />,
    },
    {
      id: "java",
      name: "PCLOUDs Java SDK",
      language: "Java",
      description: "Maven/Gradle compatible. Built with OkHttp, supports Java 11+.",
      version: "v1.4.0",
      installCommand: 'Maven: <dependency><groupId>com.pclouds</groupId><artifactId>sdk</artifactId><version>1.4.0</version></dependency>',
      githubUrl: "https://github.com/pclouds/java-sdk",
      docsUrl: "https://docs.pclouds.africa/sdk/java",
      category: "official",
      icon: <FaJava className="text-orange-400" />,
    },
    {
      id: "dotnet",
      name: "PCLOUDs .NET SDK",
      language: "C# / .NET",
      description: "NuGet package for .NET Standard 2.0+. Async APIs and dependency injection ready.",
      version: "v1.1.0",
      installCommand: "dotnet add package PClouds.Sdk",
      githubUrl: "https://github.com/pclouds/dotnet-sdk",
      docsUrl: "https://docs.pclouds.africa/sdk/dotnet",
      category: "community",
      icon: <SiDotnet className="text-purple-400" />,
    },
    {
      id: "flutter",
      name: "PCLOUDs Flutter SDK",
      language: "Dart / Flutter",
      description: "Cross‑platform mobile SDK. Built with Dio, supports Android/iOS.",
      version: "v1.0.0",
      installCommand: "flutter pub add pclouds_sdk",
      githubUrl: "https://github.com/pclouds/flutter-sdk",
      docsUrl: "https://docs.pclouds.africa/sdk/flutter",
      category: "community",
      icon: <SiDart className="text-blue-300" />,
    },
  ];

  const filteredLibraries = libraries.filter((lib) => {
    const matchesSearch = lib.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lib.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lib.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || lib.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24 relative z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-4">
            <FiCpu className="w-4 h-4" />
            <span>Developer Libraries</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
            SDKs & Libraries
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              for every language
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mt-4 text-lg">
            Official and community‑maintained SDKs to integrate PCLOUDs into your stack.
            One API, many languages.
          </p>
        </motion.div>

        {/* Search and filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="relative group max-w-2xl mx-auto mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus-within:border-blue-500/50 transition">
              <FiSearch className="text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by language, name, or description..."
                className="bg-transparent w-full outline-none text-white placeholder:text-gray-500 py-3 text-base"
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700"
              }`}
            >
              All Libraries
            </button>
            <button
              onClick={() => setSelectedCategory("official")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === "official"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700"
              }`}
            >
              Official
            </button>
            <button
              onClick={() => setSelectedCategory("community")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === "community"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700"
              }`}
            >
              Community
            </button>
          </div>
        </motion.div>

        {/* Libraries Grid */}
        {filteredLibraries.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No libraries found. Try adjusting your search.
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-20"
          >
            {filteredLibraries.map((lib) => (
              <motion.div
                key={lib.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="relative rounded-xl border border-gray-800 bg-gray-900/40 backdrop-blur-sm p-6 transition-all duration-300 hover:border-blue-500/40 hover:bg-gray-800/40"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-800/50 flex items-center justify-center text-3xl">
                    {lib.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{lib.name}</h3>
                    <p className="text-sm text-blue-400 mb-2">{lib.language}</p>
                    <p className="text-gray-400 text-sm mb-4">{lib.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span className="bg-gray-800 px-2 py-0.5 rounded">Version {lib.version}</span>
                      <span className={`px-2 py-0.5 rounded ${
                        lib.category === "official" ? "bg-green-500/20 text-green-400" : "bg-purple-500/20 text-purple-400"
                      }`}>
                        {lib.category === "official" ? "Official" : "Community"}
                      </span>
                    </div>

                    {/* Install command */}
                    <div className="bg-gray-900 rounded-lg p-2 mb-4 flex items-center justify-between gap-2 font-mono text-xs">
                      <code className="text-green-400 break-all">{lib.installCommand}</code>
                      <button
                        onClick={() => copyToClipboard(lib.installCommand, lib.id)}
                        className="text-gray-500 hover:text-white transition flex-shrink-0"
                        title="Copy command"
                      >
                        {copiedId === lib.id ? <FiCheck className="text-green-400" /> : <FiCopy />}
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <a
                        href={lib.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
                      >
                        <FiBookOpen className="w-4 h-4" />
                        Docs
                      </a>
                      <a
                        href={lib.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
                      >
                        <FiGithub className="w-4 h-4" />
                        GitHub
                      </a>
                      <button
                        onClick={() => copyToClipboard(lib.installCommand, `${lib.id}-download`)}
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition"
                      >
                        <FiDownload className="w-4 h-4" />
                        Copy Command
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 p-12 text-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-3">Missing a library?</h3>
            <p className="text-gray-400 max-w-xl mx-auto mb-6">
              We're constantly adding new SDKs. Request a library or contribute your own on GitHub.
            </p>
            <button className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition shadow-lg shadow-blue-600/20">
              Request a Library <FiArrowRight />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Library;