<template>
  <div class="welcome-message">
    <div class="welcome-icon">
      <i class="fas fa-robot"></i>
    </div>
    <h2>Добро пожаловать в AI Assistant</h2>
    <p>Я могу помочь вам с кодом, анализом файлов, созданием контента и многим другим. Начните диалог!</p>
    <div class="feature-highlights">
      <div class="feature">
        <i class="fas fa-file-upload"></i>
        <span>Загрузка файлов</span>
      </div>
      <div class="feature">
        <i class="fas fa-code"></i>
        <span>Выполнение кода</span>
      </div>
      <div class="feature">
        <i class="fas fa-paint-brush"></i>
        <span>Артефакты</span>
      </div>
      <div class="feature">
        <i class="fas fa-brain"></i>
        <span>AI анализ</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.welcome-message {
  text-align: center;
  padding: 60px $space-xl;
  max-width: 600px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.welcome-icon {
  background: $color-primary;
  width: 64px;
  height: 64px;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $space-2xl;
  font-size: 28px;
  color: white;
}

h2 {
  font-size: 28px;
  margin-bottom: $space-md;
  color: $text-primary;
  font-weight: 600;
}

p {
  color: $text-secondary;
  font-size: 16px;
  margin-bottom: 40px;
  line-height: 1.6;
}

.feature-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: $space-lg;
  width: 100%;
  max-width: 480px;

  @media (max-width: $breakpoint-mobile) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-sm;
  padding: $space-lg;
  background: $bg-code;
  border-radius: $radius-md;
  border: 1px solid $border-light;
  transition: all $transition-fast;

  &:hover {
    border-color: $color-primary;
    box-shadow: $shadow-sm;
  }

  i {
    font-size: 20px;
    color: $color-primary;
  }

  span {
    font-size: 13px;
    color: $text-secondary;
    font-weight: 500;
  }
}
</style>