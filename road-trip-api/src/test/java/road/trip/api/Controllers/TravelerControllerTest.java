package road.trip.api.Controllers;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.ConfigFileApplicationContextInitializer;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockServletContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import road.trip.api.DAOs.Traveler;
import road.trip.api.RoadTripApplication;
import road.trip.api.Services.TravelerService;

import javax.servlet.ServletContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest(classes = RoadTripApplication.class)
@ContextConfiguration(initializers = ConfigFileApplicationContextInitializer.class)
@WebAppConfiguration
@RestController
public class TravelerControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;
    private MockMvc mockMvc;
    Traveler tr;

    private Long travelerId;

    @Autowired
    TravelerService ts;

    @BeforeEach
    public void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(this.webApplicationContext).build();
    }

    @Test
    public void servletTest(){
        ServletContext servletContext = webApplicationContext.getServletContext();
        String[] allBeanNames = webApplicationContext.getBeanDefinitionNames();
        for(String beanName : allBeanNames) {
            System.out.println(beanName);
        }
        Assertions.assertNotNull(servletContext);
        Assertions.assertTrue(servletContext instanceof MockServletContext);
    }

    @Test
    public void getTravelers() throws Exception{
        tr = new Traveler();

        tr.setEmailAddress("test-test2@baylor.edu");
        tr.setUsername("test0101");
        tr.setPassword("baylorbears");
        tr.setFirstName("test2");
        tr.setLastName("test3");
        tr.setBio("Computer Science Student");

        ts.saveTraveler(tr);
        System.out.println("The Traveler id is " + tr.getId());
        travelerId = tr.getId();

        this.mockMvc.perform(get("/traveler/travelers")).andDo(print())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$[0].emailAddress").isNotEmpty()).andReturn();
    }

    @Test
    public void getTravelerById() throws Exception{
        tr = new Traveler();

        tr.setEmailAddress("test-test2@baylor.edu");
        tr.setUsername("test0101");
        tr.setPassword("baylorbears");
        tr.setFirstName("test2");
        tr.setLastName("test3");
        tr.setBio("Computer Science Student");

        ts.saveTraveler(tr);
        travelerId = tr.getId();
        this.mockMvc.perform(get("/traveler/id/{id}", travelerId)).andDo(print())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.emailAddress").value("test-test2@baylor.edu")).andReturn();
    }

    @Test
    public void getTravelerByEmail() throws Exception{
        tr = new Traveler();

        tr.setEmailAddress("testo@baylor.edu");
        tr.setUsername("test0101");
        tr.setPassword("baylorbears");
        tr.setFirstName("Dante");
        tr.setLastName("Hart");
        tr.setBio("Computer Science Student");
        ts.saveTraveler(tr);
        travelerId = tr.getId();
        this.mockMvc.perform(get("/traveler/email/{email}", tr.getEmailAddress())).andDo(print())
                 .andExpect(content().contentType("application/json"))
                 .andExpect(jsonPath("$.firstName").value("Dante")).andReturn();
    }

    @AfterEach
    public void deleteById() throws Exception {
        if (travelerId == null) return;

        ts.deleteTraveler(travelerId);
    }
}
