import React from 'react';

const AboutSection = () => {
  return (
    <section className="bg-gradient-to-r from-black via-gray-900 to-gray-800 py-12 px-6 text-white">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold mb-6 text-center text-[#1BF1A1]">About Our Platform</h2>
        <p className="text-lg leading-relaxed mb-8 text-center">
          Welcome to the ultimate online coding platform where innovation meets execution! Our platform empowers developers and enthusiasts alike to sharpen their coding skills, solve challenging problems, and compete with peers in a dynamic environment.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Coding Playground */}
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-[#1BF1A1]">Coding Playground</h3>
            <p className="text-base">
              Explore, experiment, and execute! The Coding Playground is your space to play with code, experiment with different inputs, and witness real-time execution. Analyze errors, view outputs, and track your code's performance with detailed metrics.
            </p>
          </div>

          {/* Coding Arena */}
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-[#1BF1A1]">Coding Arena</h3>
            <p className="text-base">
              Hone your skills in the Coding Arena by solving a variety of coding problems. Whether you're a beginner or an expert, there's something here for everyone. Challenge yourself or contribute by uploading your own problems for others to solve!
            </p>
          </div>

          {/* Coding Battleground */}
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-[#1BF1A1]">Coding Battleground</h3>
            <p className="text-base">
              Enter the Coding Battleground to compete in thrilling contests. Show off your skills in real-time competitions, climb the leaderboards, and prove your coding prowess. Ready to host your own contest? You can do that too!
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-3xl font-semibold mb-6 text-center text-[#1BF1A1]">Meet Our Team</h3>
          <div className="flex justify-center space-x-8">
            <div className="bg-gray-800 text-center p-6 rounded-lg shadow-lg">
              <h4 className="text-xl font-semibold text-[#1BF1A1] mb-2">Biman Das</h4>
            </div>
            <div className="bg-gray-800 text-center p-6 rounded-lg shadow-lg">
              <h4 className="text-xl font-semibold text-[#1BF1A1] mb-2">Trisha Ghosh</h4>
            </div>
            <div className="bg-gray-800 text-center p-6 rounded-lg shadow-lg">
              <h4 className="text-xl font-semibold text-[#1BF1A1] mb-2">Jyotirmoy Baidya</h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
