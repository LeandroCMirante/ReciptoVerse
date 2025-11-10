import React from "react";

const Team = () => {
  const teamMembers = [
    {
      name: "Victor Egbelu",
      title: "Founder",
      photo: "/images/team/victor-egbelu.jpg",
      linkedin:
        "https://www.linkedin.com/in/victor-egbelu-585a3532?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    },
    {
      name: "Chioma Udom",
      title: "Co-Founder",
      photo: "/images/team/chioma-udom.jpg",
      linkedin:
        "https://www.linkedin.com/in/chioma-olamide-udom-7542a497?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    },
    {
      name: "Leandro Mirante",
      title: "Lead Blockchain Dev / CTO",
      photo: "/images/team/leandro-mirante.jpg",
      linkedin: "https://www.linkedin.com/in/leandro-mirante-667a7b353/",
    },
  ];

  const partners = [
    {
      name: "HashPack",
      logo: "/images/partners/hashpack.png",
      website: "https://www.hashpack.app/",
      description: "Official Hedera Wallet Partner",
    },
    {
      name: "Hedera Foundation",
      logo: "/images/partners/Hedera_Foundation_Logo.jpg",
      website: "https://hedera.com/",
      description: "Blockchain Infrastructure Partner",
    },
  ];

  return (
    <section className="py-20 bg-slate-900/75">
      <div className="container mx-auto px-6">
        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white">Meet the Team</h2>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            The dedicated individuals building the future of commerce.
          </p>
        </div>
        <div className="flex justify-center flex-wrap gap-8 mb-20">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-lg p-6 w-64 text-center hover:bg-slate-700 transition-colors duration-300"
            >
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-slate-700">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  className="w-full h-full bg-slate-700 items-center justify-center text-slate-400 text-2xl font-bold"
                  style={{ display: "none" }}
                >
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {member.name}
              </h3>
              <p className="text-cyan-400 mb-4">{member.title}</p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300"
                title={`Connect with ${member.name} on LinkedIn`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* Partners Section */}
        <div className="border-t border-slate-700 pt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-3">
              Official Partners
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Proud to collaborate with industry-leading organizations in the
              Hedera ecosystem.
            </p>
          </div>
          <div className="flex justify-center flex-wrap gap-12 items-center">
            {partners.map((partner, index) => (
              <a
                key={index}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="bg-slate-800/50 rounded-xl p-8 w-72 text-center hover:bg-slate-800 transition-all duration-300 border border-slate-700 hover:border-cyan-500/50">
                  <div className="h-32 flex items-center justify-center mb-6">
                    <img
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      className="max-h-full max-w-full object-contain filter brightness-90 group-hover:brightness-110 transition-all duration-300"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div
                      className="h-32 bg-slate-700/50 rounded-lg items-center justify-center text-slate-400 text-xl font-bold px-4"
                      style={{ display: "none" }}
                    >
                      {partner.name}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                    {partner.name}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {partner.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
