document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('emojiInput').value = btn.getAttribute('data-emoji');
    });
});

document.getElementById('reactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const outputBox = document.getElementById('jsonResult');
    
    const link = document.getElementById('link').value;
    const emojis = document.getElementById('emojiInput').value;
    const count = document.getElementById('count').value;
    const mode = document.getElementById('mode').value;

    submitBtn.disabled = true;
    submitBtn.style.background = '#888';
    submitBtn.innerText = 'SENDING_ATTACK...';
    outputBox.innerText = '// Processing request to server...';

    try {
        const response = await fetch('/api/react', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ link, emojis, count, mode })
        });

        const result = await response.json();
        outputBox.innerText = JSON.stringify(result, null, 2);
    } catch (err) {
        outputBox.innerText = JSON.stringify({
            success: false,
            message: 'Client error or connection failed',
            error: err.message
        }, null, 2);
    } finally {
        submitBtn.disabled = false;
        submitBtn.style.background = 'var(--primary)';
        submitBtn.innerText = 'NUKIR REACTION NOW!';
    }
});
