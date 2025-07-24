"use client";
import React, { useState, useEffect, useRef } from 'react';
import { FiChevronRight } from "react-icons/fi";

const Policy = () => {
  // State for expanded sections
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Refs for content height
  const contentRefs = useRef([]);
  const [contentHeights, setContentHeights] = useState({});

  // Update content height when expanded state changes
  useEffect(() => {
    const newHeights = {};
    policyItems.forEach((item, index) => {
      if (contentRefs.current[index]) {
        newHeights[index] = expandedSection === index ? contentRefs.current[index].scrollHeight : 0;
      }
    });
    setContentHeights(newHeights);
  }, [expandedSection]);

  // Intro paragraphs
  const introParagraphs = [
    "At Syssel, we take your privacy seriously. This Privacy Policy describes how we collect, use, and handle your personal information when you use our services.",
    "We only collect information that is necessary to provide you with the best possible experience. Your data is stored securely and is only accessed when needed to provide services or as required by law.",
    "By using our services, you agree to the collection and use of information in accordance with this policy. The Personal Information that we collect is used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.",
    "We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately after they are posted.",
    "If you have any questions about this Privacy Policy, please contact us through the support section in the app or via email at privacy@syssel.com."
  ];

  // Policy content
  const policyItems = [
    {
      title: "Information Collection and Use",
      content: "We collect several different types of information for various purposes to provide and improve our service to you. The types of data we may collect include personal data (like your name, email address, phone number) and usage data (information on how you use our service). We use the collected data for providing and maintaining our service, notifying you about changes to our service, allowing you to participate in interactive features, providing customer support, and gathering analysis to improve our service."
    },
    {
      title: "Log Data",
      content: "We collect information that your browser sends whenever you visit our Service ('Log Data'). This Log Data may include information such as your computer's Internet Protocol ('IP') address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other statistics. In addition, we may use third-party services such as Google Analytics that collect, monitor, and analyze this type of information."
    },
    {
      title: "Cookies",
      content: "Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device. We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service."
    },
    {
      title: "Service Providers",
      content: "We may employ third-party companies and individuals to facilitate our Service ('Service Providers'), to provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose. We may use third-party Service Providers for monitoring and analyzing the use of our service, for payment processing, to host our infrastructure, and for marketing purposes."
    },
    {
      title: "Security",
      content: "The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security. We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information."
    },
    {
      title: "Links to Other Sites",
      content: "Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. These external websites may have their own privacy policies and customer service policies."
    },
    {
      title: "Changes to This Privacy Policy",
      content: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'effective date' at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page. By continuing to use our service after those changes become effective, you agree to be bound by the revised policy."
    }
  ];

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <div className="bg-background min-h-screen w-[95%] mx-auto mt-3 mb-5">
      <div className="rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Privacy Policy</h1>
        {introParagraphs.map((paragraph, index) => (
          <p key={index} className="text-gray-600 mb-3 text-md">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Expandable Sections */}
      <div className="space-y-3">
        {policyItems.map((item, index) => (
          <div key={index}>
            <div
              onClick={() => toggleSection(index)}
              className={`bg-white rounded-lg py-4 px-4 flex items-center transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md ${
                expandedSection === index ? "rounded-b-none" : ""
              }`}
            >
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{item.title}</p>
              </div>
              <FiChevronRight
                size={20}
                className={`text-gray-400 transition-transform duration-300 ${
                  expandedSection === index ? "rotate-90" : ""
                }`}
              />
            </div>

            {/* Expanded Content */}
            <div
              className={`bg-white overflow-hidden transition-all duration-300 ease-in-out rounded-b-lg shadow-md`}
              style={{
                maxHeight: contentHeights[index] || 0,
                opacity: expandedSection === index ? 1 : 0
              }}
            >
              <div ref={el => contentRefs.current[index] = el}>
                <div className="p-4 text-gray-600">{item.content}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Policy;