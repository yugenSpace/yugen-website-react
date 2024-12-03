import React from "react";
import { useState } from "react";
import { Link } from "react-scroll";
import { Menu } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";

/**
 * Home component: main entry point for the application
 * Features hero section, features section, about section, and footer
 */
const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Navigation configuration for both desktop and mobile menus
  const navItems = [
    { label: "About", to: "about" },
    {
      label: "Demo",
      isExternal: true,
      href: "https://docs.google.com/forms/d/1S5d45yOn69_FFaIwPf51gjLZ6ZHdawmwaZThjRo_32s/",
    },
    { label: "Contact", to: "contact" },
  ];

  // Shared props for smooth scroll navigation links
  const scrollLinkProps = {
    spy: true,
    smooth: true,
    offset: -80, // Adjust this value based on your header height
    duration: 500,
    className:
      "text-white font-bold text-sm tracking-wide hover:text-gray-200 transition-colors cursor-pointer",
  };

  // Component for fade-in animation on scroll
  // Uses Intersection Observer to trigger animation when element becomes visible
  const FadeInWhenVisible = ({ children }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header Section
       * Fixed position header with responsive navigation
       * Includes logo, desktop nav menu, and mobile hamburger menu
       */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center md:px-24 py-4 bg-black-900/80 backdrop-blur-sm">
        <img
          src={`${import.meta.env.BASE_URL}images/img_header_logo.png`}
          alt="Yugen Space Logo"
          className="h-12 w-auto object-contain"
        />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-14">
          {navItems.map((item) =>
            item.isExternal ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className={scrollLinkProps.className}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                {...scrollLinkProps}
                activeClass="text-gray-200"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu size={24} />
        </button>

        {/* Mobile Navigation Menu
         * Appears when hamburger menu is clicked
         * Overlays content on small screens
         */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-black-900/90 md:hidden">
            <nav className="flex flex-col items-center py-4">
              {navItems.map((item) =>
                item.isExternal ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className={scrollLinkProps.className + " py-3"}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to}
                    {...scrollLinkProps}
                    className={scrollLinkProps.className + " py-3"}
                    activeClass="text-gray-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section
         * Full-screen landing area with Earth backdrop
         * Features main headline and floating image stack
         */}
        <section className="relative h-screen bg-black-900 overflow-hidden">
          {/* Background Earth Image*/}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={`${import.meta.env.BASE_URL}images/img_earth_backdrop.png`}
              alt="Earth"
              className="absolute w-[125%] h-[125%] object-cover -right-1/5 -top-1/5"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
          </div>

          {/* Main Content Area
           * Two-column layout on desktop:
           * Left: Headline and CTA
           * Right: Floating image stack
           */}
          <div className="relative container mx-auto h-full px-4">
            {/* Main Content Container */}
            <div className="flex flex-col md:flex-row items-center h-full pt-64 md:pt-40">
              {/* Text Content */}
              <div className="w-full md:w-1/2  md:mb-0">
                <h1 className="text-white text-lg md:text-5xl lg:text-5xl font-semibold tracking-widest leading-tight mb-8 ">
                  <div>Making</div>
                  <div>Earth Observation</div>
                  <div>Simple</div>
                </h1>

                <a
                  href="https://docs.google.com/forms/d/1S5d45yOn69_FFaIwPf51gjLZ6ZHdawmwaZThjRo_32s/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-white text-xs font-thin tracking-wide hover:text-gray-200 transition-colors"
                >
                  Book Demo
                </a>

              
              </div>

              {/* Floating Images Stack
               * Responsive image grid with hover effects
               * Images are positioned with increasing offsets
               */}
              <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                {/* Stack Container - Controls overall stack size */}
                <div className="relative w-full max-w-[400px] md:max-w-none md:w-[400px] lg:w-[500px] h-[500px] ">
                  {/* Image Array */}
                  {[/* ... */].map((image, index) => (
                    <div
                      key={index}
                      className="absolute w-36 sm:w-44 md:w-52 lg:w-64  overflow-hidden rounded-3xl transform transition-all duration-300 hover:scale-105 shadow-lg"
                      style={{
                        top: `${index * (20 + index)}%`, // Progressive vertical offset
                        right: `${index * (25 + index)}%`, // Progressive horizontal offset
                        zIndex: 3 + index, // Stack ordering
                      }}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section
         * Highlights key platform capabilities
         * Uses FadeInWhenVisible for scroll animations
         */}
        <section className="py-24 bg-black-900 text-white">
          <div className="container mx-auto px-4">
            {/* Bottom Text */}
            <div className="text-center mb-24">
              <p className="text-white text-mediums tracking-wide font-thin">
              We do the complex satellite data processing. You get the
              valuable insights 
              </p>
            </div>

            {/* First Feature */}
            <FadeInWhenVisible>
              <div className="max-w-full mx-auto grid md:grid-cols-2 gap-60 items-center">
                {/* Image on left for first feature */}
                <img
                    src={`${import.meta.env.BASE_URL}images/img_feature_2.png`}
                    alt="Analysis Platform"
                    className="rounded-xs w-full  shadow-xs"
                  />
             <div className="space-y-6">
                  <h3 className="text-lg font-medium tracking-wider text-center md:text-left md:pl-20">
                    New age analysis platform
                  </h3>
                  <p className="text-md font-thin tracking-wide leading-relaxed text-center md:text-left md:pl-20 w-full">
                    Analyzing satellite images now will be as simple 
                    <br /> as a Google search.
                  </p>
                </div>
              </div>

              {/* Second Feature */}
              <div className="max-w-5full mx-auto grid md:grid-cols-2 gap-96 items-center mt-24">
                {/* Text on left for second feature */}
              

                <div className="space-y-4">
                  <h3 className="text-lg font-medium tracking-wider text-center md:text-left">
                    Precise soil nutrient and mineral maps
                  </h3>
                  <ul className="font-thin space-y-4 text-md tracking-wide md:justify-start">
                    <li className="flex items-center justify-center md:justify-start">
                      <span className="text-blue-gray-100"></span>
                      <span className="text-center md:text-left w-full">
                        Predict crop yields
                      </span>
                    </li>
                    <li className="flex items-center justify-center md:justify-start">
                      <span className="text-blue-gray-100"></span>
                      <span className="text-center md:text-left w-full">
                        Measure impact of your products on soil health
                      </span>
                    </li>
                    <li className="flex items-center justify-center md:justify-start">
                      <span className="text-blue-gray-100"></span>
                      <span className="text-center md:text-left w-full">
                        Monitor soil health regularly
                      </span>
                    </li>
                    <li className="flex items-center justify-center md:justify-start">
                      <span className="text-blue-gray-100"></span>
                      <span className="text-center md:text-left w-full">
                        Save expenditure on fertilizers
                      </span>
                    </li>
                    <li className="flex items-center justify-center md:justify-start">
                      <span className="text-blue-gray-100"></span>
                      <span className="text-center md:text-left w-full">
                        Increase crops yields
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Image on right for second feature */}
                <div className="flex justify-center items-center md:block">
                   <div className="flex justify-center items-center md:block">
                  <img
                    src={`${import.meta.env.BASE_URL}images/img_feature_1.png`}
                    alt="Soil Analysis"
                    className="rounded-xs w-full aspect-[4/3] shadow-xs"
                  />
                </div>
                </div>
              </div>
            </FadeInWhenVisible>
          </div>
        </section>

        {/* About Section
         * Company mission and values
         * Includes tagline and detailed description
         */}
        <section name="about" className="py-24 bg-black-900 text-white">
          <div className="container mx-auto px-4">
            <div className=" mx-auto text-center">
              <h2 className="lg:text-lg  font-medium lg:font-bold tracking-wider mb-64">
               Our proprietary sensors in space bring you the power of
                hyperspectral imaging
              </h2>

              <div className="space-y-8">
                <p className="font-thin text-sm lg:text-lg tracking-wide leading-relaxed">
                  Yugen Space is a space-tech start-up aiming to leverage the
                  advances in space sciences to tackle global crises. Our
                  mission on hand is to address the soil degradation crisis by
                  precise soil monitoring, using advanced satellites and
                  developing smart analysis systems to democratize earth
                  observation.
                </p>

                <p className="font-thin text-sm lg:text-lg tracking-wide leading-relaxed">
                  We firmly believe in our motto:
                </p>

                <blockquote className="  text-xl font-bold tracking-wider ">
                  "Grounded in Earth, Elevated by Space"
                </blockquote>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section
       * Contact information and copyright
       * Uses smooth scroll navigation
       */}
      <footer
        name="contact"
        className="bg-black-900 text-white py-12 pt-80"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <a
              href="mailto:anand@yugenspace.com"
              className="font-thin  text-xs lg:text-lg tracking-wide hover:text-gray-200 transition-colors"
            >
              contact: anand@yugenspace.com
            </a>

            <p className="mt-32 font-thin text-xs tracking-wide">
              2024 Yugen Space. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
