import React, { useState } from 'react';
import { Link } from 'react-scroll';
import { Menu } from 'lucide-react';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
    // Navigation items configuration
    const navItems = [
      { label: 'About', to: 'about' },
      { 
        label: 'Demo', 
        isExternal: true,
        href: 'https://docs.google.com/forms/d/1S5d45yOn69_FFaIwPf51gjLZ6ZHdawmwaZThjRo_32s/' 
      },
      { label: 'Contact', to: 'contact' }
    ];
  
    // Common Link props for consistent scroll behavior
    const scrollLinkProps = {
      spy: true,
      smooth: true,
      offset: -80, // Adjust this value based on your header height
      duration: 500,
      className: "text-white font-bold text-sm tracking-wide hover:text-gray-200 transition-colors cursor-pointer"
    };



  return (
    <div className="min-h-screen bg-black">
      {/* Header ************************************************************/}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center md:px-24 py-4 bg-black-900/80 backdrop-blur-sm">
        <img 
          src="/public/images/img_header_logo.png" 
          alt="Yugen Space Logo" 
          className="h-12 w-auto object-contain"
        />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-14">
          {navItems.map((item) => (
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
          ))}
        </nav>

        <button 
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu size={24} />
        </button>

        {/* Mobile Menu ************************************************************/}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-black-900/90 md:hidden">
               <nav className="flex flex-col items-center py-4">
              {navItems.map((item) => (
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
              ))}
            </nav>
          </div>
        )}
      </header>

      <main>
         {/* Hero Section ************************************************************/}
         <section className="relative h-screen bg-black-900 overflow-hidden">
          {/* Background Earth Image - Now covers full section */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="public/images/img_earth_backdrop.png"  
              alt="Earth"
              className="absolute right-0 h-full w-auto object-contain"
            />
          </div>

          {/* Content Wrapper ************************************************************/}
          <div className="relative container mx-auto h-full px-4">
            {/* Main Content Container */}
            <div className="flex flex-col md:flex-row items-center h-full pt-32 md:pt-40">
              {/* Text Content */}
              <div className="w-full md:w-1/2 mb- md:mb-0">
                <h1 className="text-white text-4xl md:text-5xl lg:text-5xl font-bold tracking-widest leading-tight mb-8 ">
                  <div>Making</div>
                  <div>Earth Observation</div>
                  <div>Simple</div>
                </h1>
                
                <a
                  href="https://docs.google.com/forms/d/1S5d45yOn69_FFaIwPf51gjLZ6ZHdawmwaZThjRo_32s/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-white text-sm font-bold tracking-wide hover:text-gray-200 transition-colors"
                >
                  Book Demo
                </a>
              </div>

             {/* Floating Images Stack ************************************************************/}
             <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                {/* Stack Container - Controls overall stack size */}
                <div className="relative w-full max-w-[500px] md:max-w-none md:w-[500px] lg:w-[600px] h-[600px] ">
                  {/* Image Array */}
                  {[
                    {
                      src: "/public/images/img_stack_1.png",
                      alt: "Satellite View"
                    },
                    {
                      src: "/public/images/img_stack_2.png",
                      alt: "Agricultural Fields"
                    },
                    {
                      src: "/public/images/img_stack_3.png",
                      alt: "Data Analysis"
                    }
                  ].map((image, index) => (
                    <div
                      key={index}
                      className="absolute w-36 sm:w-44 md:w-52 lg:w-64  overflow-hidden rounded-3xl transform transition-all duration-300 hover:scale-105 shadow-lg"
                      style={{
                        top: `${index * (20 + index)}%`,    // Progressive vertical offset
                        right: `${index * (25 + index)}%`,   // Progressive horizontal offset
                        zIndex: 3 + index                   // Stack ordering
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

          {/* Bottom Text ************************************************************/}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-white text-lg tracking-wide font-semibold">
              Our proprietary sensors in space bring you the power of hyperspectral imaging
            </p>
          </div>
        </section>

        {/* Features Section ************************************************************/}
        <section className="py-24 bg-black-900 text-white">
          <div className="container mx-auto px-4">
           

            {/* First Feature ************************************************************/}
            <div className=" max-w-full mx-auto   grid md:grid-cols-2 gap-12  items-center ">
              <img
                src="public/images/img_feature_1.png"
                alt="Soil Analysis"
                className="rounded-xs  h-3/4 w-3/4  shadow-xs"
              />
              
              <div className="space-y-6">
                <h3 className="text-xl font-bold tracking-wider">
                  Precise soil nutrient and mineral maps
                </h3>
                <ul className="font-thin space-y-4 text-md tracking-wide">
                  <li className="flex items-center ">
                    <span className="text-blue-gray-100 "></span>
                    <span>Predict crop yields</span>
                  </li>
                  <li className="flex items-center ">
                    <span className="text-blue-gray-100 "></span>
                    <span>Measure impact of your products on soil health</span>
                  </li>
                  <li className="flex items-center ">
                    <span className="text-blue-gray-100 "></span>
                    <span>Monitor soil health regularly</span>
                  </li>
                  <li className="flex items-center ">
                    <span className="text-blue-gray-100 "></span>
                    <span>Save expenditure on fertilizers</span>
                  </li>
                  <li className="flex items-center ">
                    <span className="text-blue-gray-100 "></span>
                    <span>Increase crops yields</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Second Feature ************************************************************/}
            <div className="max-w-5full  mx-auto  grid md:grid-cols-2 gap-12 items-center mt-24">
              <div className="space-y-6 md:order-1">
                <h3 className="text-xl font-bold tracking-wider">
                  New age analysis platform
                </h3>
                <p className="text-md font-thin tracking-wide leading-relaxed">
                  Analyzing satellite images now will be as simple as a Google search.
                </p>
              </div>

              <img
                src="public/images/img_feature_2.png"
                alt="Analysis Platform"
                className="rounded-xs w-full shadow-xs md:order-2"
              />
            </div>
          </div>
        </section>

        {/* About Section ************************************************************/}
        <section name="about" className="py-24 bg-black-900 text-white">
          <div className="container mx-auto px-4">
            <div className=" mx-auto text-center">
              <h2 className="text-lg font-bold tracking-wider mb-64">
                We do the complex satellite data processing.
                You get the valuable insights
              </h2>
              
              <div className="space-y-8">
                <p className="font-thin text-lg tracking-wide leading-relaxed">
                  Yugen Space is a space-tech start-up aiming to leverage the advances 
                  in space sciences to tackle global crises. Our mission on hand is to 
                  address the soil degradation crisis by precise soil monitoring, using 
                  advanced satellites and developing smart analysis systems to democratize 
                  earth observation.
                </p>

                <p className="font-thin text-lg tracking-wide leading-relaxed">
                  We firmly believe in our motto:
                </p>

                <blockquote className="text-xl font-bold tracking-wider ">
                  "Grounded in Earth, Elevated by Space"
                </blockquote>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer ************************************************************/}
      <footer section name="contact" className="bg-black-900 text-white py-12 pt-80">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <a 
              href="mailto:anand@yugenspace.com"
              className="font-thin text-md text-lg tracking-wide hover:text-gray-200 transition-colors"
            >
             contact: anand@yugenspace.com
            </a>
            
            <p className="mt-32 font-thin text-xs tracking-wide">
              © 2024 Yugen Space. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;