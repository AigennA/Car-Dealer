# Katkıda Bulunma Rehberi / Contributing Guide

## Git Yapılandırması / Git Configuration

Bu repository'ye katkıda bulunmadan önce, git yapılandırmanızı doğru şekilde ayarladığınızdan emin olun.

Before contributing to this repository, make sure your git configuration is set correctly.

### Gerekli Yapılandırma / Required Configuration

```bash
git config user.name "Aygen"
git config user.email "107804812+AigennA@users.noreply.github.com"
```

### Repository İçin Yapılandırma / Configuration for This Repository

Bu repository için özel yapılandırma yapmak isterseniz:

If you want to set configuration specifically for this repository:

```bash
cd Car-Dealer
git config --local user.name "Aygen"
git config --local user.email "107804812+AigennA@users.noreply.github.com"
```

### Doğrulama / Verification

Yapılandırmanızı doğrulamak için:

To verify your configuration:

```bash
git config user.name
git config user.email
```

## Commit Kuralları / Commit Rules

- Tüm commitler "Aygen" adına yapılmalıdır
- All commits must be made under the name "Aygen"
- Commit mesajları açık ve anlaşılır olmalıdır
- Commit messages should be clear and descriptive

## Mailmap

Bu repository `.mailmap` dosyası kullanarak tüm commit'lerin doğru şekilde atfedilmesini sağlar.

This repository uses a `.mailmap` file to ensure all commits are properly attributed.
