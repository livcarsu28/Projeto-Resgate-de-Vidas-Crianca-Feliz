document.addEventListener("DOMContentLoaded", function () {

 // === CÓDIGO DA GALERIA COM FILTROS ===

const imagensGaleria = [
    // Atividades
    {
        categoria: "atividades",
        src: "img/galeria/criança7.png",
        alt: "Atividades com as crianças"
    },
    {
        categoria: "atividades",
        src: "img/galeria/criança11.png",
        alt: "Brincadeiras na ONG"
    },
    {
        categoria: "atividades",
        src: "img/galeria/criança12.png",
        alt: "Brincadeiras na ONG"
    },
    {
        categoria: "atividades",
        src: "img/galeria/criança13.png",
        alt: "Brincadeira no pula-pula na ONG"
    },

    // Aprendizado
    {
        categoria: "aprendizado",
        src: "img/galeria/criança24.png",
        alt: "Momento de aprendizado"
    },
    {
        categoria: "aprendizado",
        src: "img/galeria/criança22.png",
        alt: "Momento de aprendizado"
    },
    {
        categoria: "aprendizado",
        src: "img/galeria/criança25.png",
        alt: "Momento de aprendizado"
    },
    {
        categoria: "aprendizado",
        src: "img/galeria/criança26.png",
        alt: "Momento de aprendizado"
    },
    {
        categoria: "aprendizado",
        src: "img/galeria/criança27.png",
        alt: "Momento de aprendizado"
    },
    {
        categoria: "aprendizado",
        src: "img/galeria/criança28.png",
        alt: "Momento de aprendizado"
    },

    // Alimentação
    {
        categoria: "alimentacao",
        src: "img/galeria/criança1.png",
        alt: "Alimentação das crianças"
    },
    {
        categoria: "alimentacao",
        src: "img/galeria/criança2.png",
        alt: "Alimentação das crianças"
    },
    {
        categoria: "alimentacao",
        src: "img/galeria/criança3.png",
        alt: "Alimentação das crianças"
    },
    {
        categoria: "alimentacao",
        src: "img/galeria/criança4.png",
        alt: "Alimentação das crianças"
    },
    {
        categoria: "alimentacao",
        src: "img/galeria/criança10.png",
        alt: "Alimentação das crianças"
    },
    {
        categoria: "alimentacao",
        src: "img/galeria/criança15.png",
        alt: "Alimentação das crianças"
    },
    {
        categoria: "alimentacao",
        src: "img/galeria/criança17.png",
        alt: "Alimentação das crianças"
    },
    
    {
        categoria: "alimentacao",
        src: "img/galeria/criança20.png",
        alt: "Alimentação das crianças"
    },
    {
        categoria: "alimentacao",
        src: "img/galeria/criança21.png",
        alt: "Alimentação das crianças"
    },

    // Momentos
    {
        categoria: "momentos",
        src: "img/galeria/criança6.png",
        alt: "Momentos especiais na ONG"
    },
    {
        categoria: "momentos",
        src: "img/galeria/criança5.png",
        alt: "Momentos especiais na ONG"
    },
    {
        categoria: "momentos",
        src: "img/galeria/criança9.png",
        alt: "Momentos especiais na ONG"
    },
    {
        categoria: "momentos",
        src: "img/galeria/criança23.png",
        alt: "Momentos especiais na ONG"
    },
    {
        categoria: "momentos",
        src: "img/galeria/criança14.png",
        alt: "Momentos especiais na ONG"
    }
];

    const filterBtns = document.querySelectorAll(".btn-filtro");
    const galeriaGrid = document.getElementById("galeriaGrid");
    const apiGaleria = "https://financeiro-ong.onrender.com/api/site-publico/imagens";
    const categoriaSite = {
        projetos: "atividades", atividades: "atividades",
        materiais: "aprendizado", aprendizado: "aprendizado",
        doacoes: "alimentacao", alimentacao: "alimentacao",
        eventos: "momentos", instalacoes: "momentos", geral: "momentos", momentos: "momentos"
    };
    let categoriaAtiva = "atividades";
    let fotosPublicadas = [];

    function carregarGaleria() {
        const fotos = [...fotosPublicadas, ...imagensGaleria].filter(foto => foto.categoria === categoriaAtiva);
        galeriaGrid.replaceChildren(...fotos.map(foto => {
            const item = document.createElement("div");
            item.className = "galeria-item show";
            const imagem = document.createElement("img");
            imagem.src = foto.src;
            imagem.alt = foto.alt;
            imagem.loading = "lazy";
            item.append(imagem);
            return item;
        }));
    }

    if (galeriaGrid) {
        filterBtns.forEach(botao => {
            botao.addEventListener("click", () => {
                filterBtns.forEach(item => item.classList.toggle("active", item === botao));
                categoriaAtiva = botao.dataset.filter;
                carregarGaleria();
            });
        });
        carregarGaleria();

        fetch(apiGaleria, { signal: AbortSignal.timeout(90000) })
            .then(resposta => {
                if (!resposta.ok) throw new Error("Galeria indisponível");
                return resposta.json();
            })
            .then(fotos => {
                if (!Array.isArray(fotos)) return;
                fotosPublicadas = fotos.filter(foto => Number.isSafeInteger(foto.id) && foto.id > 0
                    && typeof foto.categoria === "string").map(foto => {
                    const nome = foto.categoria.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
                    return {
                        src: apiGaleria + "/" + foto.id,
                        alt: "Foto da ONG — " + foto.categoria,
                        categoria: Object.hasOwn(categoriaSite, nome) ? categoriaSite[nome] : "momentos"
                    };
                });
                carregarGaleria();
            })
            .catch(() => { /* A galeria do site segue disponível durante a inicialização do sistema. */ });
    }

    const slidesWrapper = document.querySelector('.slides-wrapper');
    const dots = document.querySelectorAll('.nav-dot');

    if (slidesWrapper && dots.length > 0) {
        let currentSlide = 0;
        const totalSlides = dots.length;
        let autoPlayInterval;

        function goToSlide(index) {
            slidesWrapper.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
            currentSlide = index;
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                if (window.innerWidth > 768) resetAutoPlay();
            });
        });

        function nextSlide() {
            let next = (currentSlide + 1) % totalSlides;
            goToSlide(next);
        }

        function startAutoPlay() {
            // Apenas liga o autoplay se for ecrã de desktop (maior que 768px)
            if (window.innerWidth > 768) {
                autoPlayInterval = setInterval(nextSlide, 5000);
            }
        }

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        // --- LÓGICA DE SWIPE (ARRASTAR COM O DEDO) ---
        let startX = 0;
        let endX = 0;

        slidesWrapper.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            clearInterval(autoPlayInterval); // Pausa sempre que o utilizador toca
        }, { passive: true });

        slidesWrapper.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            let diff = startX - endX;
            // Se arrastou mais de 50px para a esquerda
            if (diff > 50) {
                let next = (currentSlide + 1) % totalSlides;
                goToSlide(next);
            }
            // Se arrastou mais de 50px para a direita
            else if (diff < -50) {
                let prev = (currentSlide - 1 + totalSlides) % totalSlides;
                goToSlide(prev);
            }
            // Retoma autoplay apenas no desktop
            if (window.innerWidth > 768) resetAutoPlay();
        }

        // Inicia na primeira vez
        startAutoPlay();

        // Se o utilizador virar o telemóvel ou redimensionar a janela, ajusta o autoplay
        window.addEventListener('resize', () => {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        });
    }

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        // Abre e fecha o menu ao clicar no hambúrguer
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');

            // Acessibilidade: atualiza o estado para leitores de ecrã
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
        });

        // Fecha o menu automaticamente quando se clica num link (melhora a experiência do utilizador)
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }
});

document.getElementById("formWhatsapp").addEventListener("submit", function(e) {

    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const empresa = document.getElementById("empresa").value;
    const telefone = document.getElementById("telefone").value;
    const email = document.getElementById("email").value;
    const assunto = document.getElementById("assunto").value;
    const mensagem = document.getElementById("mensagem").value;

    const texto = `*Nova mensagem pelo site Resgate de Vidas*

*Nome:* ${nome}
*Empresa:* ${empresa}
*Telefone:* ${telefone}
*E-mail:* ${email}
*Assunto:* ${assunto}

*Mensagem:*
${mensagem}`;

    const numero = "5515988153462";

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

    window.open(url, "_blank");
});