function showToast(message, type = 'info') {
    const className = type === 'error' ? 'toast-error' : 'toast-success';
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: "top", 
      position: "right",
      className: className,
    }).showToast();
}