// Modern scroll interactions, 3D effects, and feedback modal
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('download-btn');
  
  // Feedback Modal functionality
  const modal = document.getElementById('feedbackModal');
  const openModalBtn = document.getElementById('openFeedback');
  const closeModalBtn = document.querySelector('.modal-close');
  const feedbackForm = document.getElementById('feedbackForm');

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openModalBtn?.addEventListener('click', openModal);
  closeModalBtn?.addEventListener('click', closeModal);

  // Close modal when clicking outside
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle form submission
  feedbackForm?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = feedbackForm.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnIcon = submitBtn.querySelector('.btn-icon i');
    
    // Store original button state
    const originalText = btnText.textContent;
    const originalIcon = btnIcon.className;

    try {
      // Update button to loading state
      submitBtn.classList.add('loading');
      btnText.textContent = 'Sending...';
      btnIcon.className = 'fas fa-circle-notch';

      // Get form data
      const formData = {
        name: feedbackForm.name.value,
        email: feedbackForm.email.value,
        message: feedbackForm.message.value,
        timestamp: new Date().toISOString()
      };

      // Send to MongoDB Atlas
      const response = await fetch('http://localhost:3000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      // Success state
      submitBtn.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
      btnText.textContent = 'Sent Successfully!';
      btnIcon.className = 'fas fa-check';

      // Reset form after delay
      setTimeout(() => {
        feedbackForm.reset();
        closeModal();
        // Reset button
        submitBtn.style.background = '';
        btnText.textContent = originalText;
        btnIcon.className = originalIcon;
        submitBtn.classList.remove('loading');
      }, 2000);

    } catch (error) {
      console.error('Error:', error);
      // Error state
      submitBtn.style.background = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
      btnText.textContent = 'Failed to Send';
      btnIcon.className = 'fas fa-exclamation-circle';

      setTimeout(() => {
        // Reset button
        submitBtn.style.background = '';
        btnText.textContent = originalText;
        btnIcon.className = originalIcon;
        submitBtn.classList.remove('loading');
      }, 3000);
    }
  });
  const downloadSection = document.getElementById('download');
  const features = document.querySelectorAll('.feature-card');
  const header = document.querySelector('header');
  
  // Smooth scroll to download section
  if (btn && downloadSection) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      downloadSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Parallax and 3D effects on scroll
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        const scrolled = window.pageYOffset;
        
        // Parallax header
        if (header) {
          header.style.transform = `translateY(${scrolled * 0.5}px)`;
          header.style.opacity = Math.max(0, Math.min(1, 1 - scrolled / 700));
        }

        // 3D rotation effect for feature cards
        features.forEach(card => {
          const rect = card.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const centerX = rect.left + rect.width / 2;
          const rotateX = ((window.innerHeight / 2 - centerY) / window.innerHeight) * 10;
          const rotateY = ((window.innerWidth / 2 - centerX) / window.innerWidth) * 10;
          
          card.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateZ(10px)
          `;
        });

        ticking = false;
      });
      ticking = true;
    }
  });

  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('feature-card')) {
          entry.target.style.transform = 'translateZ(0)';
        }
      }
    });
  }, observerOptions);

  // Observe all animatable elements
  document.querySelectorAll('.feature-card, .stat-item, .section-title').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
});
