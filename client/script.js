// Обработчики событий
document.querySelectorAll('.buy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const productId = btn.dataset.productId;
    openModal(productId);
  });
});

document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.querySelector('.modal-close').addEventListener('click', closeModal);

// Функции управления модалкой
function openModal(productId) {
  document.getElementById('productId').value = productId;
  document.getElementById('modalOverlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Отправка формы
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    productId: document.getElementById('productId').value,
    name: document.querySelector('input[type="text"]').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value
  };

  try {
    const response = await fetch('http://localhost:3000/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert('Заявка успешно отправлена!');
      closeModal();
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const slideBtns = document.querySelectorAll('.class-slide__item')

  slideBtns.forEach((btn, index) => {
    console.log(window.location.pathname.match(/\/index.+.html/gi)[0]);
    
    if (window.location.pathname.match(/\/index.+.html/gi)[0] === "/index-corp.html") {
      console.log(btn.textContent.trim());
      
      if (btn.textContent.trim() === 'Бизнес') {
        btn.setAttribute('id', 'active-product')
      } else if (btn.textContent.trim() === 'Гос-сфера') {
        btn.removeAttribute('id')
      }
    } else if (window.location.pathname.match(/\/index.+.html/gi)[0] === "/index-gos.html") {
      console.log(btn.textContent.trim());

      if (btn.textContent.trim() === 'Гос-сфера') {
        btn.setAttribute('id', 'active-product')
      } else if (btn.textContent.trim() === 'Бизнес') {
        btn.removeAttribute('id')
      }
    }
    btn.addEventListener('click', () => {
      if (btn.getAttribute('id') === "active-product") {
        if (btn.textContent.trim() === 'Бизнес') {
          window.location.href = "index-corp.html"
        } else if (btn.textContent.trim() === 'Гос-сфера') {
          window.location.href = "index-gos.html"
        }
      }
    });
  })

});