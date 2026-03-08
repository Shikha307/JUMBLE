import React, { useState } from 'react';
import CandidateCard from '../components/CandidateCard';
import Navbar from '../components/Navbar';

const DUMMY_CANDIDATES = [
  {
    id: 1,
    name: "Alex Johnson",
    skills: ["React", "Node.js", "TypeScript", "Tailwind"],
    linkedin: "https://linkedin.com/in/alexj",
    email: "alex.j@example.com",
    resumeUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    id: 2,
    name: "Samantha Lee",
    skills: ["Python", "Django", "PostgreSQL", "Docker"],
    linkedin: "https://linkedin.com/in/samanthalee",
    email: "sam.lee@example.com",
    resumeUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    id: 3,
    name: "David Kim",
    skills: ["Java", "Spring Boot", "AWS", "Microservices"],
    linkedin: "https://linkedin.com/in/davidkim",
    email: "david.kim@example.com",
    resumeUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  },
  {
    id: 4,
    name: "Emily Chen",
    skills: ["Figma", "UI/UX", "CSS", "React"],
    linkedin: "https://linkedin.com/in/emilyc",
    email: "emily.c@example.com",
    resumeUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  }
];

export default function RecruiterHome() {
  const [candidates] = useState(DUMMY_CANDIDATES);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAction = (candidateId, actionType) => {
    console.log(`Recruiter ${actionType} candidate ${candidateId}`);
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  const currentCandidate = candidates[currentIndex];

  return (
    <div className="recruiter-page">
      <Navbar />

      <div className="candidates-list">
        {currentCandidate ? (
          <div className="list-card-wrapper active-card">
            <CandidateCard 
              candidate={currentCandidate} 
              onLike={(id) => handleAction(id, 'LIKED')}
              onPass={(id) => handleAction(id, 'PASSED')}
            />
          </div>
        ) : (
          <div className="no-more-profiles">
            <h2>No more candidates!</h2>
            <p>You have reviewed all available profiles. Check back later for new talent.</p>
          </div>
        )}
      </div>
    </div>
  );
}
